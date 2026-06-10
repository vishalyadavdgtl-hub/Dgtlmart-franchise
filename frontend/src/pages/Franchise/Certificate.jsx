export default function Certificate() {
  return (
    <div className="max-w-4xl mx-auto text-center mt-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Certificate</h1>
      <div className="bg-white p-10 rounded-2xl shadow border border-slate-200">
        <svg className="w-20 h-20 text-yellow-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon</h2>
        <p className="text-slate-500">Your partnership certificate is being processed. It will be unlocked here once your account successfully meets the milestone requirements.</p>
      </div>
    </div>
  );
}
