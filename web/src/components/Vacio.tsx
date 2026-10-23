import type { ReactNode } from "react";
import { EmptyState } from "@/components/aire";

type Ilustracion = "empty_no_data_variant" | "empty_no_messages" | "empty_no_signal" | "empty_not_found_variant" | "empty_map_connection";

/** Estado vacío de Aire con la ilustración elegida por nombre (por defecto, "sin datos"). */
export function Vacio({
  title,
  message,
  image = "empty_no_data_variant",
  action,
}: {
  title: string;
  message?: string;
  image?: Ilustracion;
  action?: ReactNode;
}) {
  return <EmptyState title={title} message={message} image={`/images/${image}.svg`} action={action} />;
}
