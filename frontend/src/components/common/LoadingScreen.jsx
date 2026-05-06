export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">

        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

        {/* Text */}
        <p className="text-white text-sm">Redirecting...</p>

      </div>
    </div>
  );
}