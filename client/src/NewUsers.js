import { gql, useSubscription } from '@apollo/client';

const LISTEN_FOR_USERS = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`;

export default function NewUsers() {
  const { data, loading } = useSubscription(LISTEN_FOR_USERS);

  if (loading) return <p>Loading for new users...</p>;

  return (
    <div>
      <img src={data.newUser.avatar} alt='' />
      <h2>{data.newUser.name}</h2>
    </div>
  );
}
