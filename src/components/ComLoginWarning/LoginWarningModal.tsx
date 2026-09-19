import { useKeycloak } from "@react-keycloak/web";

type LoginWarningModalProps = {
  // passed by the callers, but closing is handled by the surrounding antd Modal
  onCloseLogin?: () => void;
};

const LoginWarningModal = (_props: LoginWarningModalProps) => {
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();

  return (
    <div className="relative flex flex-col gap-3 justify-center items-center ">
      <div className="text-white">
        Bạn cần đăng nhập tài khoản để sử dụng được tính năng này
      </div>
      <button
        onClick={handleLogin}
        className="bg-[#eee] px-4 py-2 rounded-md text-[#202225]"
      >
        Đăng nhập
      </button>
    </div>
  );
};

export default LoginWarningModal;
