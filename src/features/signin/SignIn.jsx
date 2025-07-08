import { useEffect, useRef } from 'react';
import { Form, Link } from 'react-router-dom';
import Menu from '../../components/menu/Menu';

function SignInForm() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="form-container">
      <div className="left-decoration"></div>
      <Form
        autoComplete="off"
        onSubmit={(ev) => {
          const username = ev.target.elements['username'].value;
          if (username) {
            localStorage.setItem('username', username);
          }
          ev.preventDefault();
        }}
      >
        <h1 className="title">Sign In</h1>
        <div className="float-label">
          <input
            ref={inputRef}
            type="text"
            name="username"
            aria-label="User name"
            placeholder="Username"
            required
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="float-label">
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            required
          />
          <label htmlFor="password">Password</label>
        </div>
        <Link to={'/password-reset'} className="password-reset">
          Forgot password?
        </Link>
        <button>Sign In</button>
        <p className="signup-container">
          Don&apos;t have an account?{' '}
          <Link to={'/sign-up'} className="signup">
            Sign up &#x279C;
          </Link>
        </p>
      </Form>
    </div>
  );
}

function SignIn() {
  return (
    <>
      <Menu />
      <main className="account-action-container signin-container">
        <section>
          <h1 className="title">StackEm</h1>
        </section>
        <section>
          <SignInForm />
        </section>
      </main>
    </>
  );
}

export default SignIn;
