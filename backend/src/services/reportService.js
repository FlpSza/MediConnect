const { 
    Patient, 
    Doctor, 
    Appointment, 
    Payment, 
    MedicalRecord,
    HealthInsurance,
    User 
  } = require('../models');
  const { Op, fn, col } = require('sequelize');
  const logger = require('../utils/logger');
  
  /**
   * Serviço de Geração de Relatórios
   * Suporta exportação em JSON, CSV e futuramente PDF
   */
  
  class ReportService {
    constructor() {
      this.appName = process.env.APP_NAME || 'MediConnect';
    }
  
    /**
     * Gera relatório de agendamentos detalhado
     * @param {object} filters - Filtros (date_from, date_to, doctor_id, status)
     * @returns {Promise<object>}
     */
    async generateAppointmentsReport(filters = {}) {
      try {
        const { date_from, date_to, doctor_id, status } = filters;
  
        const where = {};
        
        if (date_from && date_to) {
          where.appointment_date = {
            [Op.between]: [date_from, date_to]
          };
        }
        
        if (doctor_id) where.doctor_id = doctor_id;
        if (status) where.status = status;
  
        // Buscar agendamentos completos
        const appointments = await Appointment.findAll({
          where,
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['name', 'cpf', 'phone', 'health_insurance']
            },
            {
              model: Doctor,
              as: 'doctor',
              attributes: ['name', 'crm', 'specialty']
            }
          ],
          order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
        });
  
        // Estatísticas
        const total = appointments.length;
        const byStatus = await this.groupByField(appointments, 'status');
        const byType = await this.groupByField(appointments, 'appointment_type');
        const byDoctor = await this.groupByField(appointments, 'doctor.name');
  
        return {
          report_type: 'appointments',
          period: { date_from, date_to },
          generated_at: new Date(),
          summary: {
            total,
            by_status: byStatus,
            by_type: byType,
            by_doctor: byDoctor
          },
          data: appointments.map(apt => ({
            id: apt.id,
            date: apt.appointment_date,
            time: apt.appointment_time,
            patient: apt.patient ? apt.patient.name : 'N/A',
            patient_cpf: apt.patient ? apt.patient.cpf : 'N/A',
            patient_phone: apt.patient ? apt.patient.phone : 'N/A',
            doctor: apt.doctor ? apt.doctor.name : 'N/A',
            doctor_crm: apt.doctor ? apt.doctor.crm : 'N/A',
            specialty: apt.doctor ? apt.doctor.specialty : 'N/A',
            status: apt.status,
            type: apt.appointment_type,
            duration: apt.duration,
            price: apt.price
          }))
        };
      } catch (error) {
        logger.error('Erro ao gerar relatório de agendamentos:', error);
        throw error;
      }
    }
  
    /**
     * Gera relatório financeiro detalhado
     * @param {object} filters - Filtros (date_from, date_to)
     * @returns {Promise<object>}
     */
    async generateFinancialReport(filters = {}) {
      try {
        const { date_from, date_to } = filters;
  
        const where = {};
        
        if (date_from && date_to) {
          where.payment_date = {
            [Op.between]: [date_from, date_to]
          };
        }
  
        // Buscar pagamentos
        const payments = await Payment.findAll({
          where: {
            ...where,
            payment_status: { [Op.in]: ['paid', 'partially_paid'] }
          },
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['name', 'cpf']
            },
            {
              model: Appointment,
              as: 'appointment',
              include: [
                {
                  model: Doctor,
                  as: 'doctor',
                  attributes: ['name', 'specialty']
                }
              ]
            },
            {
              model: HealthInsurance,
              as: 'healthInsurance',
              attributes: ['name']
            }
          ],
          order: [['payment_date', 'DESC']]
        });
  
        // Calcular totais
        const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        const totalDiscounts = payments.reduce((sum, p) => sum + parseFloat(p.discount || 0), 0);
        
        // Agrupar por método de pagamento
        const byPaymentMethod = {};
        payments.forEach(p => {
          if (!byPaymentMethod[p.payment_method]) {
            byPaymentMethod[p.payment_method] = { count: 0, total: 0 };
          }
          byPaymentMethod[p.payment_method].count++;
          byPaymentMethod[p.payment_method].total += parseFloat(p.amount_paid);
        });
  
        // Agrupar por médico
        const byDoctor = {};
        payments.forEach(p => {
          if (p.appointment && p.appointment.doctor) {
            const doctorName = p.appointment.doctor.name;
            if (!byDoctor[doctorName]) {
              byDoctor[doctorName] = { count: 0, total: 0 };
            }
            byDoctor[doctorName].count++;
            byDoctor[doctorName].total += parseFloat(p.amount_paid);
          }
        });
  
        // Pagamentos pendentes
        const pendingPayments = await Payment.findAll({
          where: { payment_status: 'pending' }
        });
        const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
        return {
          report_type: 'financial',
          period: { date_from, date_to },
          generated_at: new Date(),
          summary: {
            total_revenue: totalRevenue.toFixed(2),
            total_discounts: totalDiscounts.toFixed(2),
            net_revenue: (totalRevenue - totalDiscounts).toFixed(2),
            total_pending: totalPending.toFixed(2),
            total_transactions: payments.length,
            by_payment_method: byPaymentMethod,
            by_doctor: byDoctor
          },
          data: payments.map(p => ({
            id: p.id,
            date: p.payment_date,
            patient: p.patient ? p.patient.name : 'N/A',
            patient_cpf: p.patient ? p.patient.cpf : 'N/A',
            doctor: p.appointment && p.appointment.doctor ? p.appointment.doctor.name : 'N/A',
            amount: parseFloat(p.amount).toFixed(2),
            amount_paid: parseFloat(p.amount_paid).toFixed(2),
            discount: parseFloat(p.discount || 0).toFixed(2),
            payment_method: p.payment_method,
            health_insurance: p.healthInsurance ? p.healthInsurance.name : null,
            receipt_number: p.receipt_number
          }))
        };
      } catch (error) {
        logger.error('Erro ao gerar relatório financeiro:', error);
        throw error;
      }
    }
  
    /**
     * Gera relatório de pacientes
     * @returns {Promise<object>}
     */
    async generatePatientsReport() {
      try {
        const patients = await Patient.findAll({
          where: { is_active: true },
          order: [['name', 'ASC']]
        });
  
        // Estatísticas
        const total = patients.length;
        const byGender = this.groupByField(patients, 'gender');
        const byInsurance = this.groupByField(patients, 'health_insurance');
  
        // Faixa etária
        const ageRanges = this.calculateAgeRanges(patients);
  
        return {
          report_type: 'patients',
          generated_at: new Date(),
          summary: {
            total,
            by_gender: byGender,
            by_age: ageRanges,
            top_insurances: Object.entries(byInsurance)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
          },
          data: patients.map(p => ({
            id: p.id,
            name: p.name,
            cpf: p.cpf,
            birth_date: p.birth_date,
            age: p.getAge(),
            gender: p.gender,
            phone: p.phone,
            email: p.email,
            health_insurance: p.health_insurance,
            registration_date: p.registration_date,
            total_appointments: p.total_appointments,
            last_appointment: p.last_appointment_date
          }))
        };
      } catch (error) {
        logger.error('Erro ao gerar relatório de pacientes:', error);
        throw error;
      }
    }
  
    /**
     * Gera relatório de médicos e performance
     * @param {object} filters - Filtros (date_from, date_to)
     * @returns {Promise<object>}
     */
    async generateDoctorsReport(filters = {}) {
      try {
        const { date_from, date_to } = filters;
  
        const doctors = await Doctor.findAll({
          where: { is_active: true },
          order: [['name', 'ASC']]
        });
  
        // Performance (se houver filtro de data)
        let performance = null;
        if (date_from && date_to) {
          performance = await Promise.all(
            doctors.map(async (doctor) => {
              const appointments = await Appointment.count({
                where: {
                  doctor_id: doctor.id,
                  appointment_date: {
                    [Op.between]: [date_from, date_to]
                  },
                  status: 'completed'
                }
              });
  
              const revenue = await Payment.sum('amount_paid', {
                include: [
                  {
                    model: Appointment,
                    as: 'appointment',
                    where: {
                      doctor_id: doctor.id,
                      appointment_date: {
                        [Op.between]: [date_from, date_to]
                      }
                    },
                    required: true
                  }
                ],
                where: {
                  payment_status: { [Op.in]: ['paid', 'partially_paid'] }
                }
              }) || 0;
  
              return {
                doctor_id: doctor.id,
                doctor_name: doctor.name,
                specialty: doctor.specialty,
                appointments_completed: appointments,
                revenue_generated: parseFloat(revenue).toFixed(2)
              };
            })
          );
        }
  
        // Estatísticas
        const bySpecialty = this.groupByField(doctors, 'specialty');
  
        return {
          report_type: 'doctors',
          period: date_from && date_to ? { date_from, date_to } : null,
          generated_at: new Date(),
          summary: {
            total: doctors.length,
            by_specialty: bySpecialty,
            ...(performance && { performance })
          },
          data: doctors.map(d => ({
            id: d.id,
            name: d.name,
            crm: `${d.crm}/${d.crm_state}`,
            specialty: d.specialty,
            sub_specialties: d.sub_specialties,
            email: d.email,
            phone: d.phone,
            consultation_price: d.consultation_price,
            consultation_duration: d.consultation_duration,
            accepts_health_insurance: d.accepts_health_insurance
          }))
        };
      } catch (error) {
        logger.error('Erro ao gerar relatório de médicos:', error);
        throw error;
      }
    }
  
    /**
     * Gera relatório de prontuários
     * @param {object} filters - Filtros (date_from, date_to)
     * @returns {Promise<object>}
     */
    async generateMedicalRecordsReport(filters = {}) {
      try {
        const { date_from, date_to } = filters;
  
        const where = {};
        
        if (date_from && date_to) {
          where.consultation_date = {
            [Op.between]: [date_from, date_to]
          };
        }
  
        const records = await MedicalRecord.findAll({
          where,
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['name', 'cpf']
            },
            {
              model: Doctor,
              as: 'doctor',
              attributes: ['name', 'specialty']
            }
          ],
          order: [['consultation_date', 'DESC']]
        });
  
        // Estatísticas
        const total = records.length;
        const byStatus = this.groupByField(records, 'record_status');
        
        // Diagnósticos mais comuns
        const diagnoses = records
          .filter(r => r.diagnosis_primary)
          .map(r => r.diagnosis_primary);
        const diagnosisCount = this.groupByField(diagnoses);
  
        return {
          report_type: 'medical_records',
          period: { date_from, date_to },
          generated_at: new Date(),
          summary: {
            total,
            by_status: byStatus,
            common_diagnoses: Object.entries(diagnosisCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([diagnosis, count]) => ({ diagnosis, count }))
          },
          data: records.map(r => ({
            id: r.id,
            consultation_date: r.consultation_date,
            patient: r.patient ? r.patient.name : 'N/A',
            patient_cpf: r.patient ? r.patient.cpf : 'N/A',
            doctor: r.doctor ? r.doctor.name : 'N/A',
            specialty: r.doctor ? r.doctor.specialty : 'N/A',
            chief_complaint: r.chief_complaint,
            diagnosis_primary: r.diagnosis_primary,
            record_status: r.record_status,
            has_prescription: r.hasPrescription(),
            has_tests_requested: r.hasTestsRequested()
          }))
        };
      } catch (error) {
        logger.error('Erro ao gerar relatório de prontuários:', error);
        throw error;
      }
    }
  
    /**
     * Converte relatório para CSV
     * @param {object} report - Relatório gerado
     * @returns {string} CSV string
     */
    convertToCSV(report) {
      try {
        if (!report.data || report.data.length === 0) {
          return 'Nenhum dado disponível';
        }
  
        // Cabeçalhos
        const headers = Object.keys(report.data[0]);
        let csv = headers.join(',') + '\n';
  
        // Dados
        report.data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            // Escapar valores com vírgula ou aspas
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          });
          csv += values.join(',') + '\n';
        });
  
        return csv;
      } catch (error) {
        logger.error('Erro ao converter relatório para CSV:', error);
        throw error;
      }
    }
  
    /**
     * Exporta relatório em formato específico
     * @param {string} reportType - Tipo do relatório
     * @param {string} format - Formato (json, csv)
     * @param {object} filters - Filtros
     * @returns {Promise<object>}
     */
    async exportReport(reportType, format = 'json', filters = {}) {
      try {
        let report;
  
        // Gerar relatório baseado no tipo
        switch (reportType) {
          case 'appointments':
            report = await this.generateAppointmentsReport(filters);
            break;
          case 'financial':
            report = await this.generateFinancialReport(filters);
            break;
          case 'patients':
            report = await this.generatePatientsReport();
            break;
          case 'doctors':
            report = await this.generateDoctorsReport(filters);
            break;
          case 'medical-records':
            report = await this.generateMedicalRecordsReport(filters);
            break;
          default:
            throw new Error('Tipo de relatório inválido');
        }
  
        // Converter para formato solicitado
        if (format === 'csv') {
          const csv = this.convertToCSV(report);
          return {
            format: 'csv',
            content: csv,
            filename: `${reportType}_${Date.now()}.csv`
          };
        }
  
        // JSON (padrão)
        return {
          format: 'json',
          content: report,
          filename: `${reportType}_${Date.now()}.json`
        };
      } catch (error) {
        logger.error('Erro ao exportar relatório:', error);
        throw error;
      }
    }
  
    /**
     * Métodos auxiliares
     */
  
    groupByField(items, field) {
      const result = {};
      items.forEach(item => {
        // Navegar em objetos aninhados (ex: 'doctor.name')
        const value = field.split('.').reduce((obj, key) => obj?.[key], item) || 'N/A';
        result[value] = (result[value] || 0) + 1;
      });
      return result;
    }
  
    calculateAgeRanges(patients) {
      const ranges = {
        '0-17': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '60+': 0
      };
  
      patients.forEach(patient => {
        const age = patient.getAge();
        if (age <= 17) ranges['0-17']++;
        else if (age <= 30) ranges['18-30']++;
        else if (age <= 45) ranges['31-45']++;
        else if (age <= 60) ranges['46-60']++;
        else ranges['60+']++;
      });
  
      return ranges;
    }
  }
  
  // Exportar instância única (Singleton)
  const reportService = new ReportService();
  
  module.exports = reportService;
  
  /**
   * EXEMPLO DE USO:
   * 
   * const reportService = require('./services/reportService');
   * 
   * // Gerar relatório de agendamentos
   * const appointmentsReport = await reportService.generateAppointmentsReport({
   *   date_from: '2025-01-01',
   *   date_to: '2025-12-31',
   *   doctor_id: 'uuid-do-medico'
   * });
   * 
   * // Gerar relatório financeiro
   * const financialReport = await reportService.generateFinancialReport({
   *   date_from: '2025-10-01',
   *   date_to: '2025-10-31'
   * });
   * 
   * // Gerar relatório de pacientes
   * const patientsReport = await reportService.generatePatientsReport();
   * 
   * // Gerar relatório de médicos com performance
   * const doctorsReport = await reportService.generateDoctorsReport({
   *   date_from: '2025-10-01',
   *   date_to: '2025-10-31'
   * });
   * 
   * // Exportar relatório em CSV
   * const csvExport = await reportService.exportReport('financial', 'csv', {
   *   date_from: '2025-10-01',
   *   date_to: '2025-10-31'
   * });
   * 
   * // Exportar relatório em JSON
   * const jsonExport = await reportService.exportReport('appointments', 'json', {
   *   date_from: '2025-10-01',
   *   date_to: '2025-10-31'
   * });
   * 
   * TIPOS DE RELATÓRIOS:
   * - appointments: Relatório de agendamentos
   * - financial: Relatório financeiro
   * - patients: Relatório de pacientes
   * - doctors: Relatório de médicos
   * - medical-records: Relatório de prontuários
   * 
   * FORMATOS SUPORTADOS:
   * - json: JSON completo com resumo e dados
   * - csv: CSV formatado para Excel
   * 
   * CADA RELATÓRIO INCLUI:
   * - Summary: Resumo com estatísticas
   * - Data: Dados detalhados
   * - Metadados: Tipo, período, data de geração
   */