/** A profile's photo if it has one, otherwise a block of its color. */
export default function ProfileAvatar({ profile, className = "" }) {
  if (profile.avatarUrl) {
    return (
      <img src={profile.avatarUrl} alt="" className={`object-cover ${className}`} />
    );
  }
  return <div className={className} style={{ backgroundColor: profile.color }} />;
}
