-- ============================================================================
-- Loan Market - 0012: notification link targets
-- ----------------------------------------------------------------------------
-- Keep notification links internal and make existing rows route to the correct
-- workflow surfaces. Notification text remains generic and privacy-safe.
-- ============================================================================

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_link_url text default null,
  p_related_entity_type text default null,
  p_related_entity_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  if p_link_url is not null and (
    left(p_link_url, 1) <> '/'
    or left(p_link_url, 2) = '//'
    or position(chr(92) in p_link_url) > 0
  ) then
    raise exception 'Notification links must be internal paths';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    link_url,
    related_entity_type,
    related_entity_id
  )
  values (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_link_url,
    p_related_entity_type,
    p_related_entity_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.create_notification(uuid, text, text, text, text, text, uuid) to service_role;

create or replace function public.notify_contact_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.direction = 'lender_to_borrower' then
    perform public.create_notification(
      new.recipient_user_id,
      'contact_request_new',
      'New contact request',
      'A verified lender wants to connect about your loan request.',
      '/borrower/contact-requests',
      'contact_request',
      new.id
    );
  elsif new.direction = 'borrower_to_lender' then
    perform public.create_notification(
      new.recipient_user_id,
      'contact_request_new',
      'New contact request',
      'A borrower wants to connect about your loan product.',
      '/lender/contact-requests',
      'contact_request',
      new.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.notify_contact_request_status_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link text;
  v_title text;
  v_body text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status not in ('approved', 'approved_pending_payment', 'rejected') then
    return new;
  end if;

  if new.direction = 'lender_to_borrower' then
    v_link := '/lender/contact-requests';
  else
    v_link := '/borrower/contact-requests';
  end if;

  if new.status in ('approved', 'approved_pending_payment') then
    v_title := 'Contact request approved';
    v_body := case
      when new.status = 'approved_pending_payment'
        then 'Your request was approved. Complete the next step to open messaging.'
      when new.direction = 'borrower_to_lender'
        then 'The lender approved your request. You can now message them.'
      else 'The borrower approved your request. You can now message them.'
    end;
  else
    v_title := 'Contact request declined';
    v_body := case
      when new.direction = 'borrower_to_lender'
        then 'The lender declined your contact request.'
      else 'The borrower declined your contact request.'
    end;
  end if;

  perform public.create_notification(
    new.requester_user_id,
    case when new.status = 'rejected' then 'contact_request_declined' else 'contact_request_approved' end,
    v_title,
    v_body,
    v_link,
    'contact_request',
    new.id
  );

  return new;
end;
$$;

create or replace function public.notify_message_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrower_user_id uuid;
  v_lender_user_id uuid;
  v_recipient_user_id uuid;
begin
  select bp.user_id, lp.user_id
    into v_borrower_user_id, v_lender_user_id
  from public.conversations c
  join public.borrower_profiles bp on bp.id = c.borrower_id
  join public.lender_profiles lp on lp.id = c.lender_id
  where c.id = new.conversation_id;

  if new.sender_user_id = v_borrower_user_id then
    v_recipient_user_id := v_lender_user_id;
  elsif new.sender_user_id = v_lender_user_id then
    v_recipient_user_id := v_borrower_user_id;
  else
    return new;
  end if;

  if v_recipient_user_id is null then
    return new;
  end if;

  if exists (
    select 1
    from public.notifications n
    where n.user_id = v_recipient_user_id
      and n.type = 'new_message'
      and n.related_entity_type = 'conversation'
      and n.related_entity_id = new.conversation_id
      and n.read_at is null
      and n.created_at > now() - interval '5 minutes'
  ) then
    return new;
  end if;

  perform public.create_notification(
    v_recipient_user_id,
    'new_message',
    'New message',
    'You received a new message.',
    '/messages/' || new.conversation_id::text,
    'conversation',
    new.conversation_id
  );

  return new;
end;
$$;

update public.notifications n
set link_url = case
  when cr.direction = 'lender_to_borrower' then '/borrower/contact-requests'
  when cr.direction = 'borrower_to_lender' then '/lender/contact-requests'
  else link_url
end
from public.contact_requests cr
where n.type = 'contact_request_new'
  and n.related_entity_type = 'contact_request'
  and n.related_entity_id = cr.id;

update public.notifications n
set link_url = case
  when n.type = 'contact_request_approved' and c.id is not null then '/messages/' || c.id::text
  when cr.direction = 'lender_to_borrower' then '/lender/contact-requests'
  when cr.direction = 'borrower_to_lender' then '/borrower/contact-requests'
  else link_url
end
from public.contact_requests cr
left join public.conversations c on c.contact_request_id = cr.id
where n.type in ('contact_request_approved', 'contact_request_declined')
  and n.related_entity_type = 'contact_request'
  and n.related_entity_id = cr.id;

update public.notifications
set link_url = '/messages/' || related_entity_id::text
where type = 'new_message'
  and related_entity_type = 'conversation'
  and related_entity_id is not null;

update public.notifications
set link_url = null
where link_url is not null
  and (
    left(link_url, 1) <> '/'
    or left(link_url, 2) = '//'
    or position(chr(92) in link_url) > 0
  );
