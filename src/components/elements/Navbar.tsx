import { routers, type Router } from '@/config/pages';
import style from './Navbar.module.scss'
import clsx from 'clsx';
import { Link, useRoute } from 'wouter';

function NavbarItem({ router }: { router: Router }) {
    const [isActive] = useRoute(router.path);

    return (
        <Link href={router.path} className={clsx(style.item, isActive && style.active)}>
            <router.icon />
        </Link>
    );
}

export function Navbar() {

    return (
        <div className={style.navbar}>
            {
                routers.map(r => <NavbarItem router={r} />)
            }
        </div>
    );
}
