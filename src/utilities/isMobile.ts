const isMobile = (userAgent?: string) => Boolean(userAgent?.match(
  /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
));

export default isMobile;
