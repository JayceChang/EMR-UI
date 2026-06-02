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
      width:80,
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
    //   width:115,
    //   fixed: 'right',
    // }, 
    // {
    //   title: '下次上报进度逾期天数',
    //   dataIndex: 'k_complete_time_next_days',
    //   width:140,
    //   fixed: 'right',
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
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 80,
      operationData:[{
        type:'link',
        label:'查看',
        lx:'1',
        click:true,
      }]
    },
];

export const columnsLog = [
  {
    title: '操作内容',
    dataIndex: 'k_desc',
  }, 
  {
    title: '操作人',
    dataIndex: 'k_create_user',
    width:80,
  },    
  {
    title: '操作时间',
    dataIndex: 'k_create_time',
    width:150,
  },  
];

export const columnsComplete = [
  {
    title: '完成度(%)',
    dataIndex: 'k_value',
    width:80,
    dicCompareData:(value)=>{
      let color='';          
      if(value<30){
        color='#c00';
      }
      else if(value<50){
        color='#ff7500';
      }
      else if(value<80){
        color='#ffc900';
      }
      else if(value<100){
        color='#9bcc00';
      }
      else if(value){
        color='green';
      }
      return {
        color:color,
        label:value+'%'
      }
    }      
  },
  
  {
    title: '提交说明',
    dataIndex: 'k_desc',
    width:200,
  }, 
  {
    title: '已关联附件',
    dataIndex: 'k_file_ids',
    width:80,
    click:true,
    dicCompareData:(value)=>{
      let color='green';  
      let label='未关联';
      if(value){
        label="已关联:"+value.split(',').length;
      }      
      return {color:color,label:label}
    }      
  },
  {
    title: '提交人',
    dataIndex: 'k_create_user',
    width:80,
  },    
  {
    title: '提交时间',
    dataIndex: 'k_create_time',
    width:100,
  },  
];

export const columnsRepair = [
  {
    title: '审核说明',
    dataIndex: 'k_desc',
    width:200,
  }, 
    
  {//审核状态：0待审核 1审核通过 -1审核不通过
    title: '审核状态',
    dataIndex: 'k_status',
    width:80,
    dicData:[
      {
        value:'-1',
        label:'审核不通过',
        color:'red'
      },
      {
        value:'0',
        label:'待审核',
        color:'#ff9c00'
      },
      {
          value:'1',
          label:'审核通过',
          color:'green'
      },       
    ]
  },
  {
    title: '操作人',
    dataIndex: 'k_create_user',
    width:80,
  },    
  {
    title: '操作时间',
    dataIndex: 'k_create_time',
    width:150,
  },  
  {
    title: '审核人',
    dataIndex: 'k_status_user',
    width:80,
  },    
  {
    title: '审核时间',
    dataIndex: 'k_status_time',
    width:150,
  },  
  {
    title: '审核说明',
    dataIndex: 'k_status_desc',
    width:150,
  },  
  {
    title: '未通过确认',
    dataIndex: 'k_ok_status',
    width:80,
    dicData:[
      {
        value:'0',
        label:'待确认',
        color:'#ff9c00'
      },
      {
          value:'1',
          label:'已确认',
          color:'green'
      },       
    ]
  },  
  {
    title: '确认时间',
    dataIndex: 'k_ok_time',
    width:150,
  },  
];

export const columnsDelay = [
  {
    title: '延期截至日期',
    dataIndex: 'k_date',
    width:120,
  },
  {
    title: '审核说明',
    dataIndex: 'k_desc',
    width:200,
  }, 
    
  {//审核状态：0待审核 1审核通过 -1审核不通过
    title: '审核状态',
    dataIndex: 'k_status',
    width:80,
    dicData:[
      {
        value:'-1',
        label:'审核不通过',
        color:'red'
      },
      {
        value:'0',
        label:'待审核',
        color:'#ff9c00'
      },
      {
          value:'1',
          label:'审核通过',
          color:'green'
      },       
    ]
  },
  {
    title: '操作人',
    dataIndex: 'k_create_user',
    width:80,
  },    
  {
    title: '操作时间',
    dataIndex: 'k_create_time',
    width:150,
  },  

 {
    title: '审核人',
    dataIndex: 'k_status_user',
    width:80,
  },    
  {
    title: '审核时间',
    dataIndex: 'k_status_time',
    width:150,
  },  
  {
    title: '审核说明',
    dataIndex: 'k_status_desc',
    width:150,
  },  
];


export const columnsIndicator = [
  {
    title: '指标编码',
    dataIndex: 'indicator_code',
    width:250,
  }, 
  {
    title: '指标名称',
    dataIndex: 'indicator_name',
  },    
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 80,
    operationData:[{
      type:'link',
      label:'查看',
      lx:'1',
      click:true,
    }]
  },
];

export const formTitle='任务问题清单分配';



