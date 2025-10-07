CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SELECT * FROM users;
SELECT * FROM appointments;
SELECT * FROM doctors;
SELECT * FROM patients;
SELECT * FROM payments;


-- ============================================
-- MEDICONNECT - SCRIPT DE POPULAÇÃO INICIAL
-- ============================================

USE mediconnect;

-- Limpar dados existentes (CUIDADO: Remove todos os dados!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE medical_records;
TRUNCATE TABLE payments;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
TRUNCATE TABLE health_insurances;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USUÁRIOS (users)
-- ============================================
INSERT INTO users (id, name, email, password, role, phone, is_active, email_verified, preferences, created_at, updated_at) VALUES
(UUID(), 'Administrador Sistema', 'admin@mediconnect.com', '$2a$10$YJzQ8X4xFJZ4x4xFJZ4x4uYJzQ8X4xFJZ4x4xFJZ4x4xFJZ4x4xFJ', 'admin', '(11) 99999-0001', 1, 1, '{"theme":"light","notifications":true,"language":"pt-BR"}', NOW(), NOW()),
(UUID(), 'Dr. João Silva', 'joao.silva@mediconnect.com', '$2a$10$YJzQ8X4xFJZ4x4xFJZ4x4uYJzQ8X4xFJZ4x4xFJZ4x4xFJZ4x4xFJ', 'doctor', '(11) 98765-4321', 1, 1, '{"theme":"light","notifications":true,"language":"pt-BR"}', NOW(), NOW()),
(UUID(), 'Maria Santos', 'maria.santos@mediconnect.com', '$2a$10$YJzQ8X4xFJZ4x4xFJZ4x4uYJzQ8X4xFJZ4x4xFJZ4x4xFJZ4x4xFJ', 'receptionist', '(11) 98765-1234', 1, 1, '{"theme":"light","notifications":true,"language":"pt-BR"}', NOW(), NOW());

-- ============================================
-- 2. CONVÊNIOS MÉDICOS (health_insurances)
-- ============================================
INSERT INTO health_insurances (id, name, code, type, contact_phone, contact_email, is_active, created_at, updated_at) VALUES
(UUID(), 'Unimed', 'UNIMED-001', 'private', '(11) 3000-1234', 'contato@unimed.com.br', 1, NOW(), NOW()),
(UUID(), 'Bradesco Saúde', 'BRADESCO-001', 'private', '(11) 3000-5678', 'contato@bradescosaude.com.br', 1, NOW(), NOW()),
(UUID(), 'Amil', 'AMIL-001', 'private', '(11) 3000-9876', 'contato@amil.com.br', 1, NOW(), NOW()),
(UUID(), 'SulAmérica', 'SULAMERICA-001', 'private', '(11) 3000-5555', 'contato@sulamerica.com.br', 1, NOW(), NOW());

-- ============================================
-- 3. PACIENTES (patients)
-- ============================================
INSERT INTO patients (
    id, name, cpf, rg, birth_date, gender, phone, email, 
    address_street, address_number, address_neighborhood, address_city, address_state, address_zip, 
    blood_type, emergency_contact_name, emergency_contact_phone, 
    is_active, registration_date, total_appointments, created_at, updated_at
) VALUES
(UUID(), 'Carlos Oliveira', '123.456.789-00', '12.345.678-9', '1985-05-15', 'male', '(11) 91234-5678', 'carlos.oliveira@email.com', 
 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01234-567', 
 'A+', 'Ana Oliveira', '(11) 98765-4321', 
 1, CURDATE(), 0, NOW(), NOW()),

(UUID(), 'Fernanda Costa', '987.654.321-00', '98.765.432-1', '1990-08-22', 'female', '(11) 92345-6789', 'fernanda.costa@email.com', 
 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 
 'O-', 'Roberto Costa', '(11) 97654-3210', 
 1, CURDATE(), 0, NOW(), NOW()),

(UUID(), 'Pedro Santos', '456.789.123-00', '45.678.912-3', '1978-12-10', 'male', '(11) 93456-7890', 'pedro.santos@email.com', 
 'Rua Augusta', '500', 'Consolação', 'São Paulo', 'SP', '01305-000', 
 'B+', 'Julia Santos', '(11) 96543-2109', 
 1, CURDATE(), 0, NOW(), NOW());

-- ============================================
-- 4. MÉDICOS (doctors)
-- ============================================
-- Obter o ID do usuário médico
SET @doctor_user_id = (SELECT id FROM users WHERE email = 'joao.silva@mediconnect.com' LIMIT 1);

INSERT INTO doctors (
    id, user_id, name, cpf, crm, crm_state, specialty, email, phone, 
    consultation_price, consultation_duration, accepts_health_insurance, 
    bio, is_active, created_at, updated_at
) VALUES
(UUID(), @doctor_user_id, 'Dr. João Silva', '111.222.333-44', '123456', 'SP', 'Cardiologia', 'joao.silva@mediconnect.com', '(11) 98765-4321', 
 250.00, 30, 1, 
 'Especialista em Cardiologia com 15 anos de experiência', 1, NOW(), NOW()),

(UUID(), NULL, 'Dra. Patricia Mendes', '555.666.777-88', '789012', 'SP', 'Dermatologia', 'patricia.mendes@mediconnect.com', '(11) 97654-3210', 
 300.00, 30, 1, 
 'Dermatologista com foco em tratamentos estéticos', 1, NOW(), NOW());

-- ============================================
-- 5. AGENDAMENTOS (appointments)
-- ============================================
-- Obter IDs
SET @patient1_id = (SELECT id FROM patients WHERE cpf = '123.456.789-00' LIMIT 1);
SET @patient2_id = (SELECT id FROM patients WHERE cpf = '987.654.321-00' LIMIT 1);
SET @patient3_id = (SELECT id FROM patients WHERE cpf = '456.789.123-00' LIMIT 1);
SET @doctor1_id = (SELECT id FROM doctors WHERE crm = '123456' AND crm_state = 'SP' LIMIT 1);
SET @doctor2_id = (SELECT id FROM doctors WHERE crm = '789012' AND crm_state = 'SP' LIMIT 1);

INSERT INTO appointments (
    id, patient_id, doctor_id, appointment_date, appointment_time, duration, 
    status, appointment_type, reason, notes, price, payment_status, 
    created_at, updated_at
) VALUES
(UUID(), @patient1_id, @doctor1_id, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', 30, 
 'scheduled', 'first_visit', 'Avaliação cardiológica', 'Primeira consulta', 250.00, 'pending', 
 NOW(), NOW()),

(UUID(), @patient2_id, @doctor2_id, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:30:00', 30, 
 'scheduled', 'return', 'Retorno tratamento dermatológico', 'Avaliação de tratamento', 300.00, 'pending', 
 NOW(), NOW()),

(UUID(), @patient3_id, @doctor1_id, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '09:00:00', 30, 
 'scheduled', 'follow_up', 'Check-up anual', 'Consulta de rotina', 250.00, 'pending', 
 NOW(), NOW());

-- ============================================
-- 6. VERIFICAR DADOS INSERIDOS
-- ============================================
SELECT '=== USUÁRIOS ===' AS INFO;
SELECT id, name, email, role, is_active FROM users;

SELECT '=== CONVÊNIOS ===' AS INFO;
SELECT id, name, code, contact_phone FROM health_insurances;

SELECT '=== PACIENTES ===' AS INFO;
SELECT id, name, cpf, phone, email FROM patients;

SELECT '=== MÉDICOS ===' AS INFO;
SELECT id, name, CONCAT(crm, '/', crm_state) AS crm_completo, specialty, consultation_price FROM doctors;

SELECT '=== AGENDAMENTOS ===' AS INFO;
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    p.name AS paciente,
    d.name AS medico,
    a.appointment_type AS tipo,
    a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.appointment_date, a.appointment_time;

SELECT '=== RESUMO ===' AS INFO;
SELECT 
    (SELECT COUNT(*) FROM users) AS total_usuarios,
    (SELECT COUNT(*) FROM patients) AS total_pacientes,
    (SELECT COUNT(*) FROM doctors) AS total_medicos,
    (SELECT COUNT(*) FROM appointments) AS total_agendamentos,
    (SELECT COUNT(*) FROM health_insurances) AS total_convenios;
    
    === COPIE OS HASHES ABAIXO ===

admin123: $2a$10$wmevMfK6JeWnagv6C08A7ueLp5aHRlrVL.9tDkJfZubuZKhg2/ZhC
doctor123: $2a$10$iMfbGbpVMmftpRP1dwSnx.mJLyfABK/2MTM.hMvqFEVZ2bpEzSNz.
receptionist123: $2a$10$RFqJaXUIhBRJeRdpYXLB..0Xg2.jjAwy2Wlx8/5XB47gBBfg.Lx26