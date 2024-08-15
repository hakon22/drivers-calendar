const Schedule = () => null;

export const getServerSideProps = () => ({
  redirect: {
    permanent: false,
    destination: '/',
  },
});

export default Schedule;
