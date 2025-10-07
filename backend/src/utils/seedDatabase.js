const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// Importar modelos
const { User, Patient, Doctor, HealthInsurance, Appointment } = require('../models');

class DatabaseSeeder {
  constructor() {
    this.seedData = {
      users: [],
      patients: [],
      doctors: [],
      healthInsurances: [],
      appointments: []
    };
  }

  // ==================== DADOS DE SEED ====================

  getSeedData() {
    return {
      // Usuários iniciais
      users: [
        {
          id: uuidv4(),
          name: 'Administrador Sistema',
          email: 'admin@mediconnect.com',
          password: 'admin123',
          role: 'admin',
          phone: '(11) 99999-0001',
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Dr. João Silva',
          email: 'joao.silva@mediconnect.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '(11) 99999-0002',
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Maria Santos',
          email: 'maria.santos@mediconnect.com',
          password: 'receptionist123',
          role: 'receptionist',
          phone: '(11) 99999-0003',
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Dr. Ana Costa',
          email: 'ana.costa@mediconnect.com',
          password: 'doctor123',
          role: 'doctor',
          phone: '(11) 99999-0004',
          is_active: true
        }
      ],

      // Convênios médicos
      healthInsurances: [
        {
          id: uuidv4(),
          name: 'Unimed',
          code: 'UNIMED',
          type: 'health_plan',
          contact_phone: '(11) 3003-9000',
          contact_email: 'atendimento@unimed.com.br',
          reimbursement_percentage: 80,
          requires_authorization: true,
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Bradesco Saúde',
          code: 'BRADESCO',
          type: 'health_plan',
          contact_phone: '(11) 3003-8000',
          contact_email: 'atendimento@bradescosaude.com.br',
          reimbursement_percentage: 85,
          requires_authorization: true,
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'SulAmérica',
          code: 'SULAMERICA',
          type: 'health_plan',
          contact_phone: '(11) 3003-7000',
          contact_email: 'atendimento@sulamerica.com.br',
          reimbursement_percentage: 75,
          requires_authorization: false,
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Particular',
          code: 'PARTICULAR',
          type: 'private',
          contact_phone: null,
          contact_email: null,
          reimbursement_percentage: 100,
          requires_authorization: false,
          is_active: true
        }
      ],

      // Pacientes de exemplo
      patients: [
        {
          id: uuidv4(),
          name: 'Carlos Eduardo Santos',
          cpf: '12345678901',
          birth_date: '1985-03-15',
          gender: 'male',
          email: 'carlos.santos@email.com',
          phone: '(11) 98765-4321',
          phone_secondary: '(11) 98765-4322',
          address_street: 'Rua das Flores, 123',
          address_number: '123',
          address_complement: 'Apto 45',
          address_neighborhood: 'Centro',
          address_city: 'São Paulo',
          address_state: 'SP',
          address_zip: '01234-567',
          health_insurance_id: null, // Particular
          health_insurance_number: null,
          blood_type: 'O+',
          allergies: 'Nenhuma conhecida',
          chronic_diseases: null,
          medications: null,
          emergency_contact_name: 'Maria Santos',
          emergency_contact_phone: '(11) 98765-4323',
          emergency_contact_relationship: 'Esposa',
          medical_notes: 'Paciente saudável, sem histórico de doenças graves',
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Fernanda Oliveira',
          cpf: '98765432109',
          birth_date: '1990-07-22',
          gender: 'female',
          email: 'fernanda.oliveira@email.com',
          phone: '(11) 97654-3210',
          phone_secondary: null,
          address_street: 'Av. Paulista, 1000',
          address_number: '1000',
          address_complement: 'Sala 501',
          address_neighborhood: 'Bela Vista',
          address_city: 'São Paulo',
          address_state: 'SP',
          address_zip: '01310-100',
          health_insurance_id: null, // Será definido depois
          health_insurance_number: '123456789',
          blood_type: 'A+',
          allergies: 'Penicilina',
          chronic_diseases: 'Hipertensão',
          medications: 'Losartana 50mg',
          emergency_contact_name: 'Roberto Oliveira',
          emergency_contact_phone: '(11) 97654-3211',
          emergency_contact_relationship: 'Pai',
          medical_notes: 'Paciente com hipertensão controlada',
          is_active: true
        },
        {
          id: uuidv4(),
          name: 'Pedro Henrique Lima',
          cpf: '45678912345',
          birth_date: '1978-11-08',
          gender: 'male',
          email: 'pedro.lima@email.com',
          phone: '(11) 96543-2109',
          phone_secondary: '(11) 96543-2108',
          address_street: 'Rua Augusta, 500',
          address_number: '500',
          address_complement: null,
          address_neighborhood: 'Consolação',
          address_city: 'São Paulo',
          address_state: 'SP',
          address_zip: '01305-000',
          health_insurance_id: null, // Será definido depois
          health_insurance_number: '987654321',
          blood_type: 'B-',
          allergies: null,
          chronic_diseases: 'Diabetes tipo 2',
          medications: 'Metformina 850mg',
          emergency_contact_name: 'Carla Lima',
          emergency_contact_phone: '(11) 96543-2107',
          emergency_contact_relationship: 'Esposa',
          medical_notes: 'Paciente diabético, controle glicêmico regular',
          is_active: true
        }
      ],

      // Médicos de exemplo
      doctors: [
        {
          id: uuidv4(),
          user_id: null, // Será definido depois
          name: 'Dr. João Silva',
          crm: '123456',
          crm_state: 'SP',
          cpf: '11122233344',
          specialty: 'Cardiologia',
          sub_specialties: ['Cardiologia Intervencionista', 'Eletrofisiologia'],
          email: 'joao.silva@mediconnect.com',
          phone: '(11) 99999-0002',
          phone_secondary: '(11) 99999-0005',
          birth_date: '1975-05-10',
          consultation_price: 250.00,
          consultation_duration: 30,
          accepts_health_insurance: true,
          health_insurances: ['Unimed', 'Bradesco Saúde', 'SulAmérica'],
          working_hours: {
            monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
            tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
            wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
            thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
            friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
            saturday: { start: '08:00', end: '12:00', breaks: [] },
            sunday: null
          },
          bio: 'Cardiologista com mais de 15 anos de experiência, especializado em cardiologia intervencionista.',
          formation: ['Faculdade de Medicina USP', 'Residência em Cardiologia - Hospital das Clínicas', 'Fellowship em Cardiologia Intervencionista - Mayo Clinic'],
          is_active: true
        },
        {
          id: uuidv4(),
          user_id: null, // Será definido depois
          name: 'Dra. Ana Costa',
          crm: '654321',
          crm_state: 'SP',
          cpf: '55566677788',
          specialty: 'Dermatologia',
          sub_specialties: ['Dermatologia Estética', 'Dermatoscopia'],
          email: 'ana.costa@mediconnect.com',
          phone: '(11) 99999-0004',
          phone_secondary: null,
          birth_date: '1980-12-03',
          consultation_price: 200.00,
          consultation_duration: 30,
          accepts_health_insurance: true,
          health_insurances: ['Unimed', 'Bradesco Saúde'],
          working_hours: {
            monday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { start: '09:00', end: '13:00', breaks: [] },
            sunday: null
          },
          bio: 'Dermatologista especializada em dermatologia estética e cirurgia dermatológica.',
          formation: ['Faculdade de Medicina UNIFESP', 'Residência em Dermatologia - Hospital São Paulo', 'Especialização em Dermatologia Estética - SBD'],
          is_active: true
        }
      ]
    };
  }

  // ==================== MÉTODOS DE SEEDING ====================

  async seedUsers() {
    try {
      logger.info('🌱 Iniciando seeding de usuários...');
      
      const users = this.getSeedData().users;
      
      for (const userData of users) {
        // Verificar se usuário já existe
        const existingUser = await User.findOne({ where: { email: userData.email } });
        
        if (!existingUser) {
          // Hash da senha
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          const user = await User.create({
            ...userData,
            password: hashedPassword
          });
          
          this.seedData.users.push(user);
          logger.info(`✅ Usuário criado: ${user.name} (${user.email})`);
        } else {
          this.seedData.users.push(existingUser);
          logger.info(`⏭️  Usuário já existe: ${existingUser.name} (${existingUser.email})`);
        }
      }
      
      logger.info(`✅ Seeding de usuários concluído: ${this.seedData.users.length} usuários`);
    } catch (error) {
      logger.error('❌ Erro no seeding de usuários:', error);
      throw error;
    }
  }

  async seedHealthInsurances() {
    try {
      logger.info('🌱 Iniciando seeding de convênios...');
      
      const healthInsurances = this.getSeedData().healthInsurances;
      
      for (const insuranceData of healthInsurances) {
        const existingInsurance = await HealthInsurance.findOne({ 
          where: { name: insuranceData.name } 
        });
        
        if (!existingInsurance) {
          const insurance = await HealthInsurance.create(insuranceData);
          this.seedData.healthInsurances.push(insurance);
          logger.info(`✅ Convênio criado: ${insurance.name}`);
        } else {
          this.seedData.healthInsurances.push(existingInsurance);
          logger.info(`⏭️  Convênio já existe: ${existingInsurance.name}`);
        }
      }
      
      logger.info(`✅ Seeding de convênios concluído: ${this.seedData.healthInsurances.length} convênios`);
    } catch (error) {
      logger.error('❌ Erro no seeding de convênios:', error);
      throw error;
    }
  }

  async seedPatients() {
    try {
      logger.info('🌱 Iniciando seeding de pacientes...');
      
      const patients = this.getSeedData().patients;
      const particularInsurance = this.seedData.healthInsurances.find(i => i.code === 'PARTICULAR');
      const unimedInsurance = this.seedData.healthInsurances.find(i => i.code === 'UNIMED');
      
      for (let i = 0; i < patients.length; i++) {
        const patientData = { ...patients[i] };
        
        // Definir convênio baseado no índice
        if (i === 0) {
          patientData.health_insurance_id = particularInsurance?.id || null;
        } else if (i === 1) {
          patientData.health_insurance_id = unimedInsurance?.id || null;
        } else {
          patientData.health_insurance_id = unimedInsurance?.id || null;
        }
        
        const existingPatient = await Patient.findOne({ 
          where: { cpf: patientData.cpf } 
        });
        
        if (!existingPatient) {
          const patient = await Patient.create(patientData);
          this.seedData.patients.push(patient);
          logger.info(`✅ Paciente criado: ${patient.name} (CPF: ${patient.cpf})`);
        } else {
          this.seedData.patients.push(existingPatient);
          logger.info(`⏭️  Paciente já existe: ${existingPatient.name} (CPF: ${existingPatient.cpf})`);
        }
      }
      
      logger.info(`✅ Seeding de pacientes concluído: ${this.seedData.patients.length} pacientes`);
    } catch (error) {
      logger.error('❌ Erro no seeding de pacientes:', error);
      throw error;
    }
  }

  async seedDoctors() {
    try {
      logger.info('🌱 Iniciando seeding de médicos...');
      
      const doctors = this.getSeedData().doctors;
      
      for (let i = 0; i < doctors.length; i++) {
        const doctorData = { ...doctors[i] };
        
        // Associar com usuário correspondente
        const userIndex = i + 1; // Pular admin (índice 0)
        if (this.seedData.users[userIndex]) {
          doctorData.user_id = this.seedData.users[userIndex].id;
        }
        
        const existingDoctor = await Doctor.findOne({ 
          where: { crm: doctorData.crm, crm_state: doctorData.crm_state } 
        });
        
        if (!existingDoctor) {
          const doctor = await Doctor.create(doctorData);
          this.seedData.doctors.push(doctor);
          logger.info(`✅ Médico criado: ${doctor.name} (CRM: ${doctor.crm}/${doctor.crm_state})`);
        } else {
          this.seedData.doctors.push(existingDoctor);
          logger.info(`⏭️  Médico já existe: ${existingDoctor.name} (CRM: ${existingDoctor.crm}/${existingDoctor.crm_state})`);
        }
      }
      
      logger.info(`✅ Seeding de médicos concluído: ${this.seedData.doctors.length} médicos`);
    } catch (error) {
      logger.error('❌ Erro no seeding de médicos:', error);
      throw error;
    }
  }

  async seedAppointments() {
    try {
      logger.info('🌱 Iniciando seeding de agendamentos...');
      
      if (this.seedData.patients.length === 0 || this.seedData.doctors.length === 0) {
        logger.warn('⏭️  Pulando seeding de agendamentos - pacientes ou médicos não encontrados');
        return;
      }
      
      const appointments = [
        {
          id: uuidv4(),
          patient_id: this.seedData.patients[0].id,
          doctor_id: this.seedData.doctors[0].id,
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
          appointment_time: '14:30',
          duration: 30,
          status: 'scheduled',
          appointment_type: 'first_visit',
          reason: 'Consulta de rotina - check-up anual',
          price: 250.00,
          payment_status: 'pending',
          created_by: this.seedData.users[1].id // Dr. João Silva
        },
        {
          id: uuidv4(),
          patient_id: this.seedData.patients[1].id,
          doctor_id: this.seedData.doctors[1].id,
          appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
          appointment_time: '10:00',
          duration: 30,
          status: 'confirmed',
          appointment_type: 'return',
          reason: 'Retorno - controle de hipertensão',
          price: 200.00,
          payment_status: 'paid',
          created_by: this.seedData.users[3].id // Maria Santos (receptionist)
        },
        {
          id: uuidv4(),
          patient_id: this.seedData.patients[2].id,
          doctor_id: this.seedData.doctors[0].id,
          appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
          appointment_time: '16:00',
          duration: 30,
          status: 'scheduled',
          appointment_type: 'follow_up',
          reason: 'Acompanhamento diabetes',
          price: 250.00,
          payment_status: 'pending',
          created_by: this.seedData.users[3].id // Maria Santos (receptionist)
        }
      ];
      
      for (const appointmentData of appointments) {
        const existingAppointment = await Appointment.findOne({
          where: {
            patient_id: appointmentData.patient_id,
            doctor_id: appointmentData.doctor_id,
            appointment_date: appointmentData.appointment_date,
            appointment_time: appointmentData.appointment_time
          }
        });
        
        if (!existingAppointment) {
          const appointment = await Appointment.create(appointmentData);
          this.seedData.appointments.push(appointment);
          logger.info(`✅ Agendamento criado: ${appointment.appointment_date.toDateString()} às ${appointment.appointment_time}`);
        } else {
          this.seedData.appointments.push(existingAppointment);
          logger.info(`⏭️  Agendamento já existe: ${existingAppointment.appointment_date.toDateString()} às ${existingAppointment.appointment_time}`);
        }
      }
      
      logger.info(`✅ Seeding de agendamentos concluído: ${this.seedData.appointments.length} agendamentos`);
    } catch (error) {
      logger.error('❌ Erro no seeding de agendamentos:', error);
      throw error;
    }
  }

  // ==================== MÉTODO PRINCIPAL ====================

  async seedAll() {
    try {
      logger.info('🚀 Iniciando seeding completo do banco de dados...');
      
      // Ordem de seeding (respeitando dependências)
      await this.seedUsers();
      await this.seedHealthInsurances();
      await this.seedPatients();
      await this.seedDoctors();
      await this.seedAppointments();
      
      logger.info('🎉 Seeding completo concluído com sucesso!');
      logger.info(`📊 Resumo:`);
      logger.info(`   - Usuários: ${this.seedData.users.length}`);
      logger.info(`   - Convênios: ${this.seedData.healthInsurances.length}`);
      logger.info(`   - Pacientes: ${this.seedData.patients.length}`);
      logger.info(`   - Médicos: ${this.seedData.doctors.length}`);
      logger.info(`   - Agendamentos: ${this.seedData.appointments.length}`);
      
      return this.seedData;
    } catch (error) {
      logger.error('❌ Erro no seeding completo:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================

  async clearAll() {
    try {
      logger.warn('🗑️  Iniciando limpeza completa do banco...');
      
      // Ordem de limpeza (respeitando dependências)
      await Appointment.destroy({ where: {}, force: true });
      await Patient.destroy({ where: {}, force: true });
      await Doctor.destroy({ where: {}, force: true });
      await HealthInsurance.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
      
      logger.info('✅ Limpeza completa concluída');
    } catch (error) {
      logger.error('❌ Erro na limpeza:', error);
      throw error;
    }
  }

  async resetAndSeed() {
    try {
      await this.clearAll();
      await this.seedAll();
    } catch (error) {
      logger.error('❌ Erro no reset e seeding:', error);
      throw error;
    }
  }
}

// ==================== EXPORT ====================

const seeder = new DatabaseSeeder();

module.exports = seeder;
