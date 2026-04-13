import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { CSVImportModal } from "@/components/leads/CSVImportModal";

export default function LeadsPage() {
  return (
    <>
      <div className="p-6 max-w-[1200px] mx-auto">
        <LeadsTable />
      </div>
      <LeadDrawer />
      <CSVImportModal />
    </>
  );
}
