export default function LoginModal() {


  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 p-4">
      
      {/* The Glow Effect behind the modal */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 opacity-30 blur-2xl transition duration-1000"></div>
        
        {/* The Modal Content */}
        <div className="relative rounded-2xl bg-neutral-900/90 p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
          
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-sm text-neutral-400">Enter your details to access your account</p>
          </div>

          <form className="space-y-4">
            {/* Email Input - Look at the focus:ring classes */}
            <div className="space-y-1">
              <label className="label-standard">Email address</label>
              <input 
                type="email" 
                className="w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 outline-none ring-1 ring-transparent transition-all focus:bg-neutral-800 focus:ring-2 focus:ring-rose-500"
                placeholder="kevin@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="label-standard">Password</label>
                <a href="#" className="text-xs text-rose-400 hover:text-rose-300">Forgot?</a>
              </div>
              <input 
                type="password" 
                className="w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 outline-none ring-1 ring-transparent transition-all focus:bg-neutral-800 focus:ring-2 focus:ring-rose-500"
                placeholder="••••••••"
              />
            </div>

            {/* Main Action Button */}
            <button className="mt-2 w-full rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:brightness-110 hover:shadow-rose-500/40 active:scale-[0.98]">
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account? <a href="#" className="text-white underline decoration-rose-500 underline-offset-4 hover:text-rose-400">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};