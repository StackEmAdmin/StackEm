import { Form, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import verify from './formValidation';

function SignUpForm() {
  const [email, setEmail] = useState({
    value: '',
    error: '',
    touched: false,
  });
  const [username, setUsername] = useState({
    value: '',
    error: '',
    touched: false,
  });
  const [password, setPassword] = useState({
    value: '',
    error: '',
    touched: false,
  });
  const [confirmPassword, setConfirmPassword] = useState({
    value: '',
    error: '',
    touched: false,
  });
  const [inviteCode, setInviteCode] = useState({
    value: '',
    error: '',
    touched: false,
  });

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on first input field
    inputRef.current.focus();
  }, []);

  const emailOnBlur = () => {
    // After interaction add flag
    // Flag is used to show error (and not show error before interaction)
    setEmail({ ...email, touched: true });
    if (verify.email(email.value)) {
      // Passed validation
      setEmail({ ...email, error: '' });
      return;
    }
    // Failed validation and set error message
    setEmail({ ...email, error: verify.emailErr(email.value) });
  };

  const usernameOnBlur = () => {
    setUsername({ ...username, touched: true });
    if (verify.username(username.value)) {
      setUsername({ ...username, error: '' });
      return;
    }
    setUsername({ ...username, error: verify.usernameErr(username.value) });
  };

  const passwordOnBlur = () => {
    setPassword({ ...password, touched: true });
    if (verify.password(password.value)) {
      setPassword({ ...password, error: '' });
      return;
    }
    setPassword({ ...password, error: verify.passwordErr(password.value) });
  };

  const confirmPasswordOnBlur = () => {
    setConfirmPassword({ ...confirmPassword, touched: true });
    if (verify.confirmPassword(password.value, confirmPassword.value)) {
      setConfirmPassword({ ...confirmPassword, error: '' });
      return;
    }
    setConfirmPassword({
      ...confirmPassword,
      error: verify.confirmPasswordErr(),
    });
  };

  const inviteCodeOnBlur = () => {
    setInviteCode({ ...inviteCode, touched: true });
    if (verify.inviteCode(inviteCode.value)) {
      setInviteCode({ ...inviteCode, error: '' });
      return;
    }
    setInviteCode({ ...inviteCode, error: verify.inviteCodeErr() });
  };

  const formOnSubmit = (ev) => {
    if (
      email.error ||
      username.error ||
      password.error ||
      confirmPassword.error ||
      inviteCode.error
    ) {
      ev.preventDefault();
      return;
    }
    ev.preventDefault();
  };

  return (
    <div className="form-container">
      <div className="left-decoration"></div>
      <Form method="post" autoComplete="off" onSubmit={formOnSubmit}>
        <h1 className="title">Sign Up</h1>
        <div className={'float-label' + (email.error ? ' error' : '')}>
          <input
            ref={inputRef}
            type="email"
            id="email-signup"
            name="email"
            aria-label="Email"
            placeholder="Email"
            onChange={(ev) =>
              setEmail({ ...email, value: ev.currentTarget.value })
            }
            onBlur={emailOnBlur}
            required
          />
          <label htmlFor="email-signup">Email</label>
          <span className="error-text">{email.error}</span>
        </div>
        <div className={'float-label' + (username.error ? ' error' : '')}>
          <input
            type="text"
            id="username-signup"
            name="username"
            aria-label="User name"
            placeholder="Username"
            onChange={(ev) =>
              setUsername({ ...username, value: ev.currentTarget.value })
            }
            onBlur={usernameOnBlur}
            required
          />
          <label htmlFor="username-signup">Username</label>
          <span className="error-text">{username.error}</span>
        </div>
        <div className={'float-label' + (password.error ? ' error' : '')}>
          <input
            type="password"
            id="password-signup"
            name="password"
            aria-label="Password"
            placeholder="Password"
            onChange={(ev) =>
              setPassword({ ...password, value: ev.currentTarget.value })
            }
            onBlur={passwordOnBlur}
            required
          />
          <label htmlFor="password-signup">Password</label>
          <span className="error-text">{password.error}</span>
        </div>
        <div
          className={'float-label' + (confirmPassword.error ? ' error' : '')}
        >
          <input
            type="password"
            id="confirmpassword-signup"
            name="confirmpassword"
            aria-label="Confirm password"
            placeholder="Confirm password"
            onChange={(ev) =>
              setConfirmPassword({
                ...confirmPassword,
                value: ev.currentTarget.value,
              })
            }
            onBlur={confirmPasswordOnBlur}
            required
          />
          <label htmlFor="confirmpassword-signup">Confirm password</label>
          <span className="error-text">{confirmPassword.error}</span>
        </div>
        <div className={'float-label' + (inviteCode.error ? ' error' : '')}>
          <input
            type="text"
            id="invitecode-signup"
            name="invitecode"
            aria-label="Invite code"
            placeholder="Invite code"
            required
            onChange={(ev) =>
              setInviteCode({ ...inviteCode, value: ev.currentTarget.value })
            }
            onBlur={inviteCodeOnBlur}
          />
          <label htmlFor="invitecode-signup">Invite code</label>
          <span className="error-text">{inviteCode.error}</span>
        </div>
        <button type="submit">Sign Up</button>
        <p className="signup-container">
          Have an account?{' '}
          <Link to={'/sign-in'} className="signup">
            Sign in &#x279C;
          </Link>
        </p>
      </Form>
    </div>
  );
}

export default SignUpForm;
