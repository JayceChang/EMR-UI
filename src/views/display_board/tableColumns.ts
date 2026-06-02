export const columnsGZ = [
    {
      title: '指标名称',
      dataIndex: 'indicator_name',
      width:200,
      fixed: 'left',
    },
    {
      title: '指标编码',
      dataIndex: 'indicator_code',
      width:150,
    },
    {
      title: '章',
      dataIndex: 'z_name',
      width:200,
    },
    {
      title: '节',
      dataIndex: 'j_name',
      width:180,
    },
    {
      title: '采集方式',
      dataIndex: 'cjfs',
      width:80,
      dicData:[
        {
          value:'1',
          label:'自动取数 ',
          color:'green',
        },        
        {
            value:'2',
            label:'手动填报',
            color:'red',
        },    
        {
          value:'',
          label:'未配置',
          color:'',
        },          
      ]
    },
    {
      title: '开展情况',
      dataIndex: 'iskz',
      width:80,
      dicData:[
        {
          value:'0',
          label:'未开展',
          color:'red',
          tag:'1',
        },        
        {
            value:'1',
            label:'已开展',
            color:'green',
            tag:'1',
        }, 
        {
          value:'',
          label:'未配置',
          color:'',
          tag:'1',
        },               
      ]
    },
    {
          title: '责任科室',
          dataIndex: 'department',
          width:150,
        },    
        {
          title: '责任人',
          dataIndex: 'person',
          width:80,
    },      
    {
          title: '监督科室',
          dataIndex: 's_department',
          width:150,
        },
        {
          title: '监督人',
          dataIndex: 's_person',
          width:80,
        },         
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 60,     
      operationData:[{
        type:'link',
        className:'c_ff9c00',
        icon:'AmazonOutlined',
        label:'详情',
        lx:'indicator_name',
        click:true,
      }]
    },
];

//填报数据列
export const columnsTB=[
  {
    title: '科室名称',
    dataIndex: 'department',
    width:170,
  },
  {
    title: '责任指标数量',
    dataIndex: 'zbcount',
    width:100,
    color:'#000',
    className:'fw_600'
  }, 
  {
    title: '待填报',
    dataIndex: 'nocount',
    width:80,    
    dicCompareData:(value)=>{
      let color='green';  
      let label=value;
      if(value>0){
        color='red';  
      }      
      return {color:color,label:label}
    } 
  }, 
  {
    title: '已填报',
    dataIndex: 'ycount',
    width:80,
    dicCompareData:(value)=>{
      let color='#999';  
      let label=value;
      if(value>0){
        color='green';  
      }      
      return {color:color,label:label}
    } 
  }, 
  {
    title: '填报进度',
    dataIndex: 'jindu',
    progress:true,
    width:120,
    color:'#ff9c00'
  }, 
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 60,     
    operationData:[{
      type:'link',
      icon:'RadarChartOutlined',
      label:'查看',
      lx:'ks_name',
      click:true,
    }]
  },
]

