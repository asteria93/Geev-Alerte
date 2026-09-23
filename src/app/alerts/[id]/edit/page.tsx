import { notFound, redirect } from "next/navigation";
import { AlertForm } from "@/components/alert-form";
import { prisma } from "@/lib/db";
import { updateAlertAction } from "@/lib/alert-actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditAlertPage({ params }: Props) {
  const { id } = await params;
  const alert = await prisma.alert.findUnique({ where: { id } });

  if (!alert) {
    notFound();
  }

  async function editAction(formData: FormData) {
    "use server";
    await updateAlertAction(id, formData);
    redirect("/alerts");
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Modifier l&apos;alerte</h2>
      <AlertForm
        action={editAction}
        submitLabel="Mettre à jour"
        defaultValues={{
          name: alert.name,
          categories: alert.categories as string[],
          keywords: alert.keywords as string[],
          keywordMode: alert.keywordMode,
          locationType: alert.locationType,
          locationValue: alert.locationValue,
          radiusKm: alert.radiusKm,
          frequencyMinutes: alert.frequencyMinutes,
          isActive: alert.isActive,
        }}
      />
    </section>
  );
}
