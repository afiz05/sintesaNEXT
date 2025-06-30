import { AuthDebugger } from "@/components/debug/AuthDebugger";

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Authentication Debug Tool
      </h1>
      <AuthDebugger />
    </div>
  );
}
