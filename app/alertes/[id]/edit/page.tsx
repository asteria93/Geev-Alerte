import { AlertForm } from "@/components/alert-form";
import { getAlertById } from "@/lib/storage";

export default async function EditAlertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await getAlertById(id);

  if (!alert) {
    return <section className="card error">Alerte introuvable.</section>;
  }

  return <AlertForm mode="edit" initialValue={alert} />;
}
