import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-center items-start pt-28 pb-20 px-4 min-h-[80vh]">
      <div className="w-full max-w-md fade-in surface rounded-lg p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
