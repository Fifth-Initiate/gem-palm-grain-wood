import { createFileRoute } from "@tanstack/react-router";
import { Instrument } from "@/components/instrument";

export const Route = createFileRoute("/")({ component: Instrument });
