import PageMeta from "../../components/common/PageMeta";

export default function PatientHistory() {
  return (
    <>
      <PageMeta
        title="Patient History"
        description="Patient checkup history"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <h1>Patient History</h1>
      </div>
    </>
  );
}
