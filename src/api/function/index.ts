import { useRouter } from 'vue-router';
import { useUserStore } from '/@/store/modules/system/user';
export const functionList=()=>{
    const router = useRouter();
    // 获取当前路由对象
    const currentRoute = router.currentRoute.value;
    const useUser=useUserStore();
    let menuRouter=useUser.menuRouterList.find(x=>x.path==currentRoute.path);
    let pointsList=[];
    if(menuRouter){
        pointsList=useUser.pointsList.filter(x=>x.parentId==menuRouter.menuId);
    }
    return pointsList;
}