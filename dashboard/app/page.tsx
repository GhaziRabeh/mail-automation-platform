import Stats from "./components/Stats";
import ProspectTable from "./components/ProspectTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F8FA] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Outreach
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Mail Automation Dashboard
            </h1>
          </div>
        </header>

        <Stats />

        <div className="mt-8">
          <ProspectTable />
        </div>
      </div>
    </main>
  );
}
