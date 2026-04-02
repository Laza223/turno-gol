import { prisma } from "@/lib/prisma";
import { hashPin, verifyPin } from "@/lib/utils/pin";

export class SettingsService {
  static async getComplexSettings(complexId: string) {
    return prisma.complex.findUnique({
      where: { id: complexId }
    });
  }

  static async updateGeneralInfo(complexId: string, data: { name: string; phone: string; address: string; openTime: string; closeTime: string; }) {
    return prisma.complex.update({
      where: { id: complexId },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        openTime: data.openTime,
        closeTime: data.closeTime
      }
    });
  }

  static async updateFinancials(complexId: string, data: { depositEnabled: boolean; depositType: string | null; depositValue: number | null; transferAlias: string | null; transferCbu: string | null; }) {
    return prisma.complex.update({
      where: { id: complexId },
      data: {
        depositEnabled: data.depositEnabled,
        depositType: data.depositType,
        depositValue: data.depositValue,
        transferAlias: data.transferAlias,
        transferCbu: data.transferCbu
      }
    });
  }

  static async updateBookingRules(complexId: string, data: { maxAdvanceDays: number; cancellationPolicy: string; cancellationHours: number | null; }) {
    return prisma.complex.update({
      where: { id: complexId },
      data: {
        maxAdvanceDays: data.maxAdvanceDays,
        cancellationPolicy: data.cancellationPolicy,
        cancellationHours: data.cancellationHours
      }
    });
  }

  static async updateWhatsappTemplates(complexId: string, data: {
    waTemplateConfirmation: string | null;
    waTemplateDeposit: string | null;
    waTemplateReminder: string | null;
    waTemplateCancellation: string | null;
  }) {
    return prisma.complex.update({
      where: { id: complexId },
      data: {
        waTemplateConfirmation: data.waTemplateConfirmation,
        waTemplateDeposit: data.waTemplateDeposit,
        waTemplateReminder: data.waTemplateReminder,
        waTemplateCancellation: data.waTemplateCancellation
      }
    });
  }

  static async updatePin(complexId: string, currentPin: string, newPin: string) {
    const complex = await prisma.complex.findUnique({
      where: { id: complexId },
      select: { pinHash: true }
    });

    if (!complex) throw new Error("Complejo no encontrado");
    
    // Verificamos pin actual si existe
    if (complex.pinHash) {
      if (!(await verifyPin(currentPin, complex.pinHash))) {
        throw new Error("El PIN actual es incorrecto");
      }
    }

    const newHash = await hashPin(newPin);
    return prisma.complex.update({
       where: { id: complexId },
       data: { pinHash: newHash }
    });
  }
}
