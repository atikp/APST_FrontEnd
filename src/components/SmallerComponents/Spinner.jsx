export default function Spinner() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50" />
    </div>
  );
}