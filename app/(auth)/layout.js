// whatever you put this file, it will be used as the layout for all routes under /auth  that is sign-in and sign-up
// so you can use it to style the sign-in and sign-up pages

const AuthLayout = ({ children }) => {
    return <div className="flex justify-center pt-40">{children}</div>;
  };
  
  export default AuthLayout;