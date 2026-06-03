\set ON_ERROR_ROLLBACK on
\set QUIET on
\pset pager off
-- uids
\set admin   '''00000000-0000-0000-0000-0000000a0001'''
\set bobB    '''00000000-0000-0000-0000-0000000b0001'''
\set carlC   '''00000000-0000-0000-0000-0000000c0001'''
\set lenderV '''00000000-0000-0000-0000-0000000d0001'''
\set lenderU '''00000000-0000-0000-0000-0000000e0001'''
\set lr1     '''10000000-0000-0000-0000-000000000001'''
\set ll1     '''20000000-0000-0000-0000-000000000001'''

\echo '════════ T1: privacy — contact info tables not readable by others ════════'
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  \echo 'verified lender V reading profiles (own only expected =1):'
  select count(*) as profiles_visible from public.profiles;
  \echo 'verified lender V reading OTHER lender_profiles (expect cannot see Uma; own=1):'
  select count(*) as lender_profiles_visible from public.lender_profiles;
rollback;
begin;
  set local role anon;
  \echo 'anon reading profiles (expect 0):'
  select count(*) as anon_profiles from public.profiles;
  \echo 'anon reading lender_profiles (expect 0):'
  select count(*) as anon_lender_profiles from public.lender_profiles;
  \echo 'anon reading loan_requests base table (expect 0):'
  select count(*) as anon_loan_requests from public.loan_requests;
rollback;

\echo '════════ T2: safe views readable by anon (no contact columns) ════════'
begin;
  set local role anon;
  select count(*) as preview_rows from public.loan_request_previews;
  select count(*) as directory_rows from public.lender_directory;
  select count(*) as listing_cards from public.lender_listing_cards;
  \echo 'directory columns (must NOT include email/phone/website):'
  select string_agg(column_name, ', ' order by ordinal_position) as cols
    from information_schema.columns where table_name='lender_directory';
rollback;

\echo '════════ T3: verified lender sees full loan_requests; unverified does not ════════'
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  \echo 'verified lender V loan_requests visible (expect 1, incl borrower_note):'
  select count(*) as v_sees, max(borrower_note) as note from public.loan_requests;
rollback;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderU, true);
  \echo 'UNVERIFIED lender U loan_requests visible (expect 0):'
  select count(*) as u_sees from public.loan_requests;
rollback;

\echo '════════ T4: BOARD 1 lifecycle (lender->borrower, free) ════════'
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  select public.request_loan_request_contact(:lr1) as id \gset req1_
commit;
\echo 'created board1 request:' :req1_id
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  \echo 'EXPECT-FAIL: requester (lender) cannot approve own request'
  select public.approve_contact_request(:'req1_id');
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  \echo 'EXPECT-FAIL: non-recipient (Carl) cannot approve'
  select public.approve_contact_request(:'req1_id');
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :bobB, true);
  \echo 'borrower Bob approves (expect approved):'
  select public.approve_contact_request(:'req1_id') as status;
  select id as cid from public.conversations where contact_request_id = :'req1_id' \gset conv1_
commit;
\echo 'conversation id:' :conv1_cid
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  insert into public.messages(conversation_id, sender_user_id, body)
    values (:'conv1_cid', :lenderV, 'Hi Bob, I can help with your mortgage.');
  \echo 'lender posted message ok'
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  \echo 'EXPECT-FAIL: non-participant Carl cannot post into conversation'
  insert into public.messages(conversation_id, sender_user_id, body)
    values (:'conv1_cid', :carlC, 'I should not be able to write here');
  \echo 'non-participant Carl reading messages (expect 0):'
  select count(*) as carl_sees from public.messages where conversation_id = :'conv1_cid';
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :bobB, true);
  \echo 'participant Bob reading messages (expect 1):'
  select count(*) as bob_sees from public.messages where conversation_id = :'conv1_cid';
commit;

\echo '════════ T5: BOARD 2 free lifecycle (borrower->lender, payment disabled) ════════'
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :bobB, true);
  select public.request_listing_contact(:ll1) as id \gset req2_
  \echo 'board2 request created; row state (expect payment_required=f, status=pending):'
  select status, payment_required, payment_status, amount_cents
    from public.contact_requests where id = :'req2_id';
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  \echo 'lender V approves board2 free (expect approved):'
  select public.approve_contact_request(:'req2_id') as status;
  select count(*) as conv_exists from public.conversations where contact_request_id = :'req2_id';
commit;

\echo '════════ T6: BOARD 2 PAID lifecycle + payment gate ════════'
-- enable the paid feature
update public.platform_settings set borrower_listing_contact_payment_enabled = true where id=1;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  select public.request_listing_contact(:ll1) as id \gset req3_
  \echo 'paid request created (expect payment_required=t, payment_status=not_required, amount=500):'
  select status, payment_required, payment_status, amount_cents
    from public.contact_requests where id = :'req3_id';
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  \echo 'lender approves paid request (expect approved_pending_payment, NO conversation, expires_at set):'
  select public.approve_contact_request(:'req3_id') as status;
  select status, payment_status,
         (expires_at is not null) as has_expiry,
         (expires_at > now() + interval '23 hours') as window_24h
    from public.contact_requests where id = :'req3_id';
  select count(*) as conv_before_pay from public.conversations where contact_request_id = :'req3_id';
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  \echo 'EXPECT-FAIL: borrower cannot self-confirm payment'
  select public.mark_contact_request_paid(:'req3_id', 'sess_test');
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :admin, true);
  \echo 'admin/backend marks paid (expect approved):'
  select public.mark_contact_request_paid(:'req3_id', 'sess_test_123') as status;
  select status, payment_status from public.contact_requests where id = :'req3_id';
  select count(*) as conv_after_pay from public.conversations where contact_request_id = :'req3_id';
commit;
\echo 'payment row recorded (as postgres ground truth):'
select payment_type, amount_cents, status, stripe_session_id from public.payments where contact_request_id = :'req3_id';

\echo '════════ T7: expiry sweep + payment race guard ════════'
-- new listing so Carl can make a fresh paid request
insert into public.lender_listings(id,lender_id,product_title,loan_category,status)
 values ('20000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-0000000d0001','Second Product','personal','active');
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  select public.request_listing_contact('20000000-0000-0000-0000-000000000002') as id \gset req4_
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  select public.approve_contact_request(:'req4_id') as status;
commit;
-- force the window into the past (simulate 24h elapsed)
update public.contact_requests set expires_at = now() - interval '1 minute' where id = (select id from public.contact_requests where lender_listing_id='20000000-0000-0000-0000-000000000002');
\echo 'run expire sweep (as backend/postgres):'
select public.expire_overdue_contact_requests() as expired_count;
\echo 'request state after sweep (expect expired):'
select status, payment_status from public.contact_requests where lender_listing_id='20000000-0000-0000-0000-000000000002';
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :admin, true);
  \echo 'EXPECT race-guard: mark_paid on expired returns expired, opens NO conversation:'
  select public.mark_contact_request_paid(:'req4_id') as status;
commit;
select count(*) as conv_for_expired from public.conversations where contact_request_id = :'req4_id';

\echo '════════ T8: lender weekly free-contact cap ════════'
-- cap to 1; lender V already had 1 approved lender->borrower in T4 this week
update public.platform_settings set lender_free_contacts_per_week = 1 where id=1;
\echo 'weekly approved count for lender V (expect 1):'
select public.lender_weekly_approved_contacts('d0000000-0000-0000-0000-0000000d0001') as weekly_count;
-- Carl posts a loan request so V can request a 2nd borrower contact
insert into public.loan_requests(id,borrower_id,loan_category,status)
 values ('10000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-0000000c0001','auto','active');
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderV, true);
  select public.request_loan_request_contact('10000000-0000-0000-0000-000000000002') as id \gset req5_
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  \echo 'EXPECT-FAIL: approving exceeds lender weekly cap (1):'
  select public.approve_contact_request(:'req5_id');
commit;
-- restore cap
update public.platform_settings set lender_free_contacts_per_week = 5 where id=1;

\echo '════════ T9: privilege guards ════════'
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :bobB, true);
  \echo 'EXPECT-FAIL: borrower cannot self-promote to admin'
  update public.profiles set role='admin' where user_id = :bobB;
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :lenderU, true);
  \echo 'EXPECT-FAIL: lender cannot self-verify'
  update public.lender_profiles set verification_status='verified' where user_id = :lenderU;
commit;

\echo '════════ T10: block enforcement ════════'
-- Carl and Lender V share a paid conversation (req3). Carl blocks V, then tries to message.
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  insert into public.blocks(blocker_user_id, blocked_user_id) values (:carlC, :lenderV);
  select id as cid from public.conversations where contact_request_id = :'req3_id' \gset conv3_
  \echo 'EXPECT-FAIL: messaging blocked after block in place'
  insert into public.messages(conversation_id, sender_user_id, body)
    values (:'conv3_cid', :carlC, 'should be blocked');
commit;
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', :carlC, true);
  \echo 'EXPECT-FAIL: new contact request blocked between blocked parties'
  select public.request_listing_contact('20000000-0000-0000-0000-000000000002');
commit;
\echo '════════ TESTS COMPLETE ════════'
