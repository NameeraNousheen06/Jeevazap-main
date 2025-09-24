export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mini Habit Tracker
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Build better habits, one day at a time
            </p>
          </div>
          <div className="text-sm text-gray-500">
            📍 Asia/Kolkata
          </div>
        </div>
      </div>
    </header>
  );
}