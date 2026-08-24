export function Avatar({ member, size = 36 }) {
  if (!member) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center text-gray-400"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        ?
      </div>
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shadow-sm"
      style={{ width: size, height: size, backgroundColor: member.color, fontSize: size * 0.5 }}
      title={member.name}
    >
      <span>{member.emoji || member.name?.[0]?.toUpperCase()}</span>
    </div>
  );
}

export function MemberChip({ member }) {
  if (!member) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: member.color }}
    >
      <span>{member.emoji}</span>
      {member.name}
    </span>
  );
}
