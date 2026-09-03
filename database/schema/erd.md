# Entity Relationship Diagram (ERD) Overview

This document outlines the high-level schema relationships for the Padhaanewala PostgreSQL Database.

## 1. User & Access Management
- **Users**: Core authentication. Has one `Role`, one `StudentProfile` (optional), one `CounsellorProfile` (optional).
- **Roles & Permissions**: Many-to-many relationship via `user_permissions`.

## 2. Student Domain
- **StudentProfiles**: Linked to `Users`. Contains demographic data.
- **SavedColleges**: Many-to-many between `StudentProfiles` and `Colleges`.
- **StudentInterests**: Many-to-many between `StudentProfiles` and `Courses`.

## 3. College & Course Domain
- **Universities**: Has many `Colleges`.
- **Locations**: Has many `Colleges`.
- **Colleges**: Has many `Facilities` (M:M), `CollegeCourses` (1:M), `Reviews`, `Media`.
- **Courses**: Master catalog of degrees/programs.
- **CollegeCourses**: Junction linking `Colleges` and `Courses`. Contains seats.
  - **Fees**: Tied to a specific `CollegeCourse`.
  - **Cutoffs**: Tied to a specific `CollegeCourse`.
  - **Eligibility**: Tied to a specific `CollegeCourse`.

## 4. Assessment & Mock Tests
- **QuestionBanks**: Contains many `Questions`.
- **MockTests**: Contains many `Questions` via `MockTestQuestions` (M:M).
- **TestAttempts**: Links `StudentProfiles` and `MockTests`.
- **TestResults**: 1:1 with `TestAttempts`.

## 5. Content & CRM
- **BlogArticles, FAQs, CMSContent**: Standalone or linked to `Users` (authors).
- **Enquiries**: Submitted by users/guests.
- **Leads**: 1:1 with `Enquiries`. Assigned to `Counsellors`. Has many `LeadActivities`.

## 6. AI & RAG (pgvector)
- **RAGDocuments**: Source documents.
- **DocumentChunks**: Text chunks of documents.
- **Embeddings**: 1:1 with `DocumentChunks`. Contains 1536-dimensional `Vector` for similarity search.
