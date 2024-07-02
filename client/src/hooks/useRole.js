import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth.jsx";
import useAxiosSecure from "./useAxiosSecure.jsx";

const useRole = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: role = '', isLoading } = useQuery({
    queryKey: ['role', user?.email],
    enabled: !loading && !!user?.email,
    queryFn: async () => {
      const { data } = await axiosSecure(`/user/${user?.email}`);
      return data.role;
    },
  });

  return [role, isLoading];
};

export default useRole;
