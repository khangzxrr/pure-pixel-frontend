import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { signOut } from "supertokens-website";

const Home = () => {
  const session = useSessionContext();

  if (session.loading) {
    return <div>Loading...</div>;
  }

  if (session.doesSessionExist === false) {
    return <div>Session does not exist</div>
  }

  console.log(session)

  async function onLogout() {
    await signOut();
    window.location.href = '/auth';
  }

  return (<div>
    <button onClick={onLogout}>Logout</button>
  </div>);
};

export default Home;

