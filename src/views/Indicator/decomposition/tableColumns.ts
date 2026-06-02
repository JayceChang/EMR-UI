import { indicatorManageApi } from '/@/api/business/rating/indicator/manage/indicator-manage-api';
import { departmentApi } from '/@/api/system/department-api';
import { employeeApi } from '/@/api/system/employee-api';
export const columns = [
    {
      title: '任务名称',
      dataIndex: 'k_name',
      width:190,
    },
    {
      title: '任务描述',
      dataIndex: 'k_desc',
      width:200,
    },
    {
      title: '已关联指标',
      dataIndex: 'indicator_code',
      width:150,
      click:true,
      dicCompareData:(value)=>{
        let color='green';  
        let label='未关联';
        if(value!=''){
          label="已关联:"+value.split(',').length;
        }      
        return {color:color,label:label}
      }      
    },
    {
      title: '完成进度',
      dataIndex: 'k_complete_value',
      progress:true,
      width:120,
      // sorter: {
      //   compare: (a, b) => a.k_complete_value - b.k_complete_value,
      //   multiple: 2,
      // },
    },
    {//是否完成：-1审核不通过 0待确认 1进行中 2已完成并提交审核3已完成审核通过
      title: '完成状态',
      dataIndex: 'k_complete',
      width:100,
      dicData:[
        {
          value:'-1',
          label:'审核不通过',
          color:'red',
          tag:'1',
        },
        {
          value:'0',
          label:'待确认',
          color:'yellow',
          tag:'1',
        },
        {
            value:'1',
            label:'进行中',
            color:'blue',
            tag:'1',
        },
        {
            value:'2',
            label:'审核中',
            color:'red',
            tag:'1',
        },
        {
            value:'3',
            label:'已完成',
            color:'green',
            tag:'1',

        },       
      ]
    },
    {
      title: '责任科室',
      dataIndex: 'department',
      width:100,
    },
    {
      title: '责任人',
      dataIndex: 'person',
      width:80,
    },
    {
      title: '监督科室',
      dataIndex: 's_department',
      width:100,
    },
    {
      title: '监督人',
      dataIndex: 's_person',
      width:80,
    },
    {
      title: '优先级权重',
      dataIndex: 'weight',
      progress_steps:true,
      width:80,
      // sorter: {
      //   compare: (a, b) => a.weight - b.weight,
      //   multiple: 1,
      // },
    },
    {
      title: '截至日期',
      dataIndex: 'k_end_date',
      width:100,
    },
    {
      title: '延续截至日期',
      dataIndex: 'k_end_date_delay',
      width:100,
    },
    {
      title: '逾期天数',
      dataIndex: 'k_end_date_delay_days',
      width:100,
      dicCompareData:(value)=>{
          let color='';
          let label='已逾期';
          if(value>10){
            color='#c00';
          }
          else if(value>8){
            color='#ff7500';
          }
          else if(value>4){
            color='#ffc900';
          }
          else if(value>0){
            color='#9bcc00';
          }
          else{
             color='green';
             label='剩余';
             value=(-1*value);
          }
          return {color:color,label:`${label}：${value}天`}
      }      
    },
    {
      title: '确认时间',
      dataIndex: 'k_complete_date',
      width:120,
    }, 
    {
      title: '首次完成时间',
      dataIndex: 'k_complete_date_end_one',
      width:120,
    },       
    {
      title: '最终完成时间',
      dataIndex: 'k_complete_date_end',
      width:120,
    },     
    {
      title: '进度提交时间',
      dataIndex: 'k_complete_time',
      width:120,
    },
    // {
    //   title: '上报间隔(天)',
    //   dataIndex: 'k_complete_day',
    //   width:120,
    // }, 
    {
      title: '返修次数',
      dataIndex: 'k_return_repair',
      width:80,
      // sorter: {
      //   compare: (a, b) => a.k_return_repair - b.k_return_repair,
      //   multiple: 2,
      // },
    },        
    // {
    //   title: '下次上报进度时间',
    //   dataIndex: 'k_complete_time_next',
    //   width:120,
    // },  
    // {
    //   title: '下次上报进度逾期天数',
    //   dataIndex: 'k_complete_time_next_days',
    //   width:140,
    //   dicCompareData:(value)=>{
    //       let color='';
    //       let label='已逾期';
    //       if(value>30){
    //         color='#c00';
    //       }
    //       else if(value>20){
    //         color='#ff7500';
    //       }
    //       else if(value>10){
    //         color='#ffc900';
    //       }
    //       else if(value>0){
    //         color='#9bcc00';
    //       }
    //       else if(value){
    //          color='green';
    //          label='剩余';
    //          value=(-1*value);
    //       }
    //       else {
    //         return {color:color,label:''};
    //       }
    //       return {color:color,label:`${label}：${value}天`}
    //   }      
    // },    
    {
      title: '操作人',
      dataIndex: 'k_update_user',
      width:100,
    },
    {
      title: '操作时间',
      dataIndex: 'k_update_time',
      width:150,
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 150,
      operationData:[{
        type:'link',
        label:'编辑',
        lx:'1',
        click:true,
      },{
        type:'link',
        label:'删除',
        lx:'-1',
        danger:true,
        click:true,
      },{
        type:'text',
        label:'查看',
        lx:'2',
        click:true,
      }]
    },
];

export const formItemList=[
  {label:'任务名称',key:'k_name',type:'input',required:true,},
  {label:'任务描述',key:'k_desc',type:'textarea',},
  // {label:'关联指标',key:'indicator_code',type:'select_tree',cell:24,
  //   apiFunc:indicatorManageApi.queryIndicatorTree,
  //   apiParams:true,
  //   fieldNames:{ label: 'indicatorName', value: 'indicatorCode', key: 'id', children: 'children' },
  //   bindName:'indicator_name',
  //   sumName:true,
  // },
  // {label:'指标编码',key:'indicator_code',type:'input',disabled:true,},
  // {label:'指标名称',key:'indicator_name',type:'input',disabled:true,},
  {label:'关联指标',key:'indicator_code',type:'select_tree_multiple',cell:24,
    apiUrl:'queryIndicatorTree',
    apiFunc:indicatorManageApi.queryIndicatorTree,
    apiParams:true,
    fieldNames:{ label: 'indicatorName', value: 'indicatorCode', key: 'id', children: 'children' },
    sumName:true,
    multiple:true,
    bindName:'indicator_name'
  },
  {label:'责任科室',key:'department_id',type:'select_tree',required:true,
    apiUrl:'queryDepartmentTree',
    apiFunc:departmentApi.queryDepartmentTree,
    apiParams:true,
    fieldNames:{ label: 'name', key: 'departmentId', value: 'departmentId', children: 'children' },
    bindName:'department'
  },
  {label:'责任人',key:'person_id',type:'select_tree',required:true,
    apiUrl:'queryEmployeeByDeptId',
    apiFunc:employeeApi.queryEmployeeByDeptId,
    apiParams:true,
    fieldNames:{ label: 'actualName', key: 'employeeId', value: 'employeeId', children: 'children' },
    bindName:'person',
    valueName:'department_id',
    defaultKey:'default_person_id',
  },
  {label:'监督科室',key:'s_department_id',type:'select_tree',required:true,
    apiUrl:'queryDepartmentTree',
    apiFunc:departmentApi.queryDepartmentTree,
    apiParams:true,
    fieldNames:{ label: 'name', key: 'departmentId', value: 'departmentId', children: 'children' },
    bindName:'s_department',
  },
  {label:'监督人',key:'s_person_id',type:'select_tree',required:true,
    apiUrl:'queryEmployeeByDeptId',
    apiFunc:employeeApi.queryEmployeeByDeptId,
    apiParams:true,
    fieldNames:{ label: 'actualName', key: 'employeeId', value: 'employeeId', children: 'children' },
    bindName:'s_person',
    valueName:'s_department_id',
    defaultKey:'default_s_person_id',
  },
  {label:'截至日期',key:'k_end_date',type:'date',required:true,cell:12},    
  //{label:'上报进度天数',key:'k_complete_day',type:'number',required:true,cell:12},  
  {label:'优先级权重1-100',key:'weight',type:'number',min:1,max:100,cell:12},
  

]
export const formTitle='任务问题清单分配';

export const init_data=(data,item)=>{
  let keys=Object.keys(item);
  if(keys.length>0){
    keys.forEach(element => {
        // 检查 属性 是否存在
        if (item[element] !== undefined && item[element] !== null) {
          data[element]=item[element];
        }
        else{
          data[element]='';
        }            
    }); 
  }
  else{
    formItemList.forEach(obj => {
        var element=obj.key;
        if(element){
          data[element]=undefined;
        }
    });
  }
  
}