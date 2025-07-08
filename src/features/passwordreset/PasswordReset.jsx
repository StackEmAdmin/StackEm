import { useEffect, useRef, useState } from 'react';
import { Form, Link } from 'react-router-dom';
import Menu from '../../components/menu/Menu';
import verify from '../signup/formValidation';

function PasswordResetForm() {
  const [email, setEmail] = useState({ value: '', error: '', touched: false });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const emailOnBlur = () => {
    setEmail({ ...email, touched: true });
    if (verify.email(email.value)) {
      setEmail({ ...email, error: '' });
      return;
    }
    setEmail({ ...email, error: verify.emailErr(email.value) });
  };

  return (
    <div className="form-container">
      <div className="left-decoration"></div>
      <Form
        autoComplete="off"
        onSubmit={(ev) => {
          ev.preventDefault();
        }}
      >
        <h1 className="title">Reset your password</h1>
        <div className={'float-label' + (email.error ? ' error' : '')}>
          <input
            ref={inputRef}
            type="email"
            id="email-passwordreset"
            name="email"
            aria-label="Email"
            placeholder="Email"
            onChange={(ev) =>
              setEmail({ ...email, value: ev.currentTarget.value })
            }
            onBlur={emailOnBlur}
            required
          />
          <label htmlFor="email-passwordreset">Email</label>
          <span className="error-text">{email.error}</span>
        </div>
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}

function PasswordReset() {
  return (
    <>
      <Menu />
      <main className="account-action-container signin-container">
        <section>
          <h1 className="title">StackEm</h1>
        </section>
        <section>
          <PasswordResetForm />
        </section>
      </main>
    </>
  );
}

export default PasswordReset;
