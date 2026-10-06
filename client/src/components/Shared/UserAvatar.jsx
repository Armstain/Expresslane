import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name = "", email = "") => {
  const source = name?.trim() || email?.split("@")[0] || "?";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const UserAvatar = ({ src, name, email, className }) => (
  <Avatar className={className}>
    {src && <AvatarImage src={src} alt={name || email || "User"} />}
    <AvatarFallback>{getInitials(name, email)}</AvatarFallback>
  </Avatar>
);

UserAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  className: PropTypes.string,
};

export default UserAvatar;
