-- Seed test users + data (run as a superuser/postgres; bypasses RLS).
-- Fixed UUIDs make the RLS test assertions deterministic.
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-0000000a0001','admin@test'),
 ('00000000-0000-0000-0000-0000000b0001','borrowerB@test'),
 ('00000000-0000-0000-0000-0000000c0001','borrowerC@test'),
 ('00000000-0000-0000-0000-0000000d0001','lenderV@test'),
 ('00000000-0000-0000-0000-0000000e0001','lenderU@test');

insert into public.profiles(id,user_id,role,full_name,email,phone) values
 ('a0000000-0000-0000-0000-0000000a0001','00000000-0000-0000-0000-0000000a0001','admin','Admin','admin@test','111'),
 ('a0000000-0000-0000-0000-0000000b0001','00000000-0000-0000-0000-0000000b0001','borrower','Bob B','bob@test','222'),
 ('a0000000-0000-0000-0000-0000000c0001','00000000-0000-0000-0000-0000000c0001','borrower','Carl C','carl@test','333'),
 ('a0000000-0000-0000-0000-0000000d0001','00000000-0000-0000-0000-0000000d0001','lender','Val V','val@biz','444'),
 ('a0000000-0000-0000-0000-0000000e0001','00000000-0000-0000-0000-0000000e0001','lender','Uma U','uma@biz','555');

insert into public.borrower_profiles(id,user_id,display_name,city,province) values
 ('b0000000-0000-0000-0000-0000000b0001','00000000-0000-0000-0000-0000000b0001','Bob','Toronto','ON'),
 ('b0000000-0000-0000-0000-0000000c0001','00000000-0000-0000-0000-0000000c0001','Carl','Ottawa','ON');

insert into public.lender_profiles(id,user_id,legal_name,business_name,business_email,phone,website_or_social,lender_type,operating_provinces,verification_status,accepts_platform_rules) values
 ('d0000000-0000-0000-0000-0000000d0001','00000000-0000-0000-0000-0000000d0001','Val Legal','Val Lending','val@biz','444','val.example.com','private_lender','{ON,BC}','verified',true),
 ('d0000000-0000-0000-0000-0000000e0001','00000000-0000-0000-0000-0000000e0001','Uma Legal','Uma Capital','uma@biz','555','uma.example.com','financing_company','{ON}','pending_verification',true);

insert into public.loan_requests(id,borrower_id,loan_category,province,city,amount_range,purpose_category,secured_status,borrower_note,status) values
 ('10000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-0000000b0001','mortgage','ON','Toronto','100k-150k','home purchase','secured','Need a mortgage, private note here','active');

insert into public.lender_listings(id,lender_id,product_title,loan_category,service_area,amount_range,rate_range,secured_status,product_description,status) values
 ('20000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-0000000d0001','Fast Private Mortgage','mortgage','Ontario','50k-500k','8-12%','secured','We fund quickly','active');
