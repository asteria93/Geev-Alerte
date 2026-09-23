import { redirect } from "next/navigation";
import { AlertForm } from "@/components/alert-form";
import { createAlertAction } from "@/lib/alert-actions";

async function createAction(formData: FormData) {
  "use server";
  await createAlertAction(formData);
  redirect("/alerts");
}

export default function NewAlertPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Créer une alerte</h2>
      <AlertForm action={createAction} submitLabel="Créer l'alerte" />
    </section>
  );
}
