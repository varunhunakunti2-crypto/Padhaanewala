INSERT INTO courses (id, name, slug, level, degree, duration_months, eligibility, entrance_exam, admission_procedure, career_info, description, fee_info, meta_title, meta_description, is_published, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Bachelor of Medicine and Bachelor of Surgery', 'mbbs', 'Undergraduate', 'MBBS', 66, '10+2 with Physics, Chemistry, and Biology (Minimum 50% marks). Minimum age 17 years.', 'NEET UG', 'Admission is based solely on the NEET UG score followed by MCC or state counseling.', 'Medical Officer, General Physician, Surgeon (after PG), Healthcare Administrator, Medical Researcher.', 'MBBS is a 5.5-year undergraduate medical degree program that equips students with the knowledge and skills to practice medicine and surgery.', 'Government colleges: ₹50,000 - ₹2 Lakhs\nPrivate colleges: ₹10 Lakhs - ₹1 Crore+', 'MBBS Course Details - Eligibility, Fees & Top Colleges', 'Everything about the MBBS degree in India. Find out NEET cutoffs, admission procedures, and career opportunities.', true, NOW(), NOW()),
(gen_random_uuid(), 'Bachelor of Dental Surgery', 'bds', 'Undergraduate', 'BDS', 60, '10+2 with PCB (Minimum 50% marks).', 'NEET UG', 'Through NEET UG counseling.', 'Dentist, Dental Surgeon, Oral Pathologist, Public Health Specialist.', 'BDS is a 5-year undergraduate program focusing on dental sciences and surgeries.', '₹1 Lakh - ₹40 Lakhs depending on govt/private.', 'BDS Course - Admission, Eligibility, Colleges', 'Learn about Bachelor of Dental Surgery (BDS). See entrance exams, duration, and top dental colleges in India.', true, NOW(), NOW()),
(gen_random_uuid(), 'Bachelor of Ayurvedic Medicine and Surgery', 'bams', 'Undergraduate', 'BAMS', 66, '10+2 with PCB. Knowledge of Sanskrit is an advantage.', 'NEET UG', 'AYUSH counseling based on NEET scores.', 'Ayurvedic Doctor, Medical Officer, Health Supervisor.', 'BAMS focuses on the traditional Indian system of Ayurveda.', '₹50,000 to ₹15 Lakhs', 'BAMS Course - Fees, Colleges & Career', 'Comprehensive details about the BAMS degree. Ayurveda courses, colleges, and admission info.', true, NOW(), NOW()),
(gen_random_uuid(), 'Bachelor of Technology (Computer Science)', 'btech-cse', 'Undergraduate', 'B.Tech/B.E.', 48, '10+2 with Physics, Chemistry, and Mathematics (PCM).', 'JEE Main, JEE Advanced, State CETs', 'JoSAA/CSAB counseling or state-level counseling.', 'Software Engineer, Data Scientist, Systems Analyst, Cloud Architect.', 'The most sought-after engineering branch focusing on computer programming and hardware.', '₹4 Lakhs - ₹20 Lakhs', 'B.Tech Computer Science (CSE) Course Guide', 'Find top engineering colleges for B.Tech in CSE. View JEE cutoffs and placement stats.', true, NOW(), NOW()),
(gen_random_uuid(), 'Master of Business Administration', 'mba', 'Postgraduate', 'MBA', 24, 'Bachelor''s degree in any discipline with a minimum of 50%.', 'CAT, XAT, MAT, CMAT', 'Entrance exam followed by GD and PI.', 'Marketing Manager, Financial Analyst, HR Manager, Operations Head.', 'A 2-year postgraduate program covering various aspects of business management.', '₹2 Lakhs - ₹30 Lakhs', 'MBA Course - Fees, Exams & Top B-Schools', 'Top MBA colleges in India. Learn about CAT, admissions, specializations and career paths.', true, NOW(), NOW()),
(gen_random_uuid(), 'Bachelor of Pharmacy', 'b-pharm', 'Undergraduate', 'B.Pharm', 48, '10+2 with PCB/PCM.', 'State Pharmacy Entrance Exams, NEET (in some cases)', 'State counseling.', 'Pharmacist, Drug Inspector, Quality Control Associate.', 'A 4-year undergraduate program focusing on the properties and impacts of medicines.', '₹2 Lakhs - ₹8 Lakhs', 'B.Pharm Course - Top Pharmacy Colleges', 'Admission guide for Bachelor of Pharmacy. Check syllabus, fees, and career scope.', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  degree = EXCLUDED.degree,
  duration_months = EXCLUDED.duration_months,
  eligibility = EXCLUDED.eligibility,
  entrance_exam = EXCLUDED.entrance_exam,
  admission_procedure = EXCLUDED.admission_procedure,
  career_info = EXCLUDED.career_info,
  description = EXCLUDED.description,
  fee_info = EXCLUDED.fee_info,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
