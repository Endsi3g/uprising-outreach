import { use } from "react";
import { ProjectDetailClient } from "./ProjectDetailClient";

export function generateStaticParams() {
  return [];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectDetailClient id={id} />;
}
