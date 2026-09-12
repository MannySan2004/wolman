import { useNavigate } from "react-router-dom";

const profiles = [
  { id: 1, name: "Manuel", color: "bg-red-600" },
  { id: 2, name: "Guest", color: "bg-blue-600" },
];

export default function ProfileSelect() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black">
      <h1 className="mb-10 text-3xl text-white md:text-4xl">
        Who's watching?
      </h1>
      <div className="flex gap-8">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => navigate("/browse")}
            className="group flex flex-col items-center gap-3"
          >
            <div
              className={`h-24 w-24 rounded ${profile.color} transition group-hover:ring-4 group-hover:ring-white md:h-32 md:w-32`}
            />
            <span className="text-gray-300 group-hover:text-white">
              {profile.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
