import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 overflow-y-auto">
      <div className="flex flex-col items-center gap-10 w-full max-w-sm mt-52">
        <Image src="/logo.svg" alt="Logo" width={160} height={160} priority />
        
        <div className="flex flex-col gap-4 w-full">
          <button className="h-13 rounded-lg mt-10 font-bold text-base flex items-center justify-center bg-[#FEE500] text-[#191600] border border-[#FEE500] gap-2">
            <Image src="/login/kakao.svg" alt="kakao" width={22} height={22} className="mr-1" />
            카카오로 시작하기
          </button>
          <button className="h-13 rounded-lg font-bold text-base flex items-center justify-center bg-white text-[#191919] border border-[#E0E0E0] gap-2">
            <Image src="/login/google.svg" alt="google" width={24} height={24} className="mr-1" />
            구글로 시작하기
          </button>
          <button className="h-13 rounded-lg font-bold text-base flex items-center justify-center bg-[#45B649] text-white border border-[#03C75A] gap-2">
            <Image src="/login/naver.svg" alt="naver" width={24} height={24} className="mr-1" />
            네이버로 시작하기
          </button>
          <div className="text-xs text-gray-400 text-center font-light mt-2">ⓒ 2025 마음예보</div>
        </div>
      </div>
    </div>
  );
}
