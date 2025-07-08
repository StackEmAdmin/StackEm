import Menu from '../../components/menu/Menu';
import SignUpForm from './SignUpForm';

function SignUp() {
  return (
    <>
      <Menu />
      <main className="account-action-container signin-container">
        <section>
          <h1 className="title">StackEm</h1>
        </section>
        <section>
          <SignUpForm />
        </section>
      </main>
    </>
  );
}

export default SignUp;
