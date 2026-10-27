import HeaderMobile from "./HeaderMobile";
import HeaderMedium from "./HeaderMedium";
import HeaderDesktop from "./HeaderDesktop";

export default function HeaderWrapper() {
    return (
        <>
            <div className="block md:hidden">
                <HeaderMobile />
            </div>
            <div className="hidden md:block lg:hidden">
                <HeaderMedium />
            </div>
            <div className="hidden lg:block">
                <HeaderDesktop />
            </div>
        </>
    );
}
