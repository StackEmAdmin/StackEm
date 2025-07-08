import Welcome from './Welcome';
import Footer from '../../components/footer/Footer';
import './Home.css';

function Home() {
  return (
    <>
      <main className="main home">
        <section className="section page">
          <Welcome />
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
