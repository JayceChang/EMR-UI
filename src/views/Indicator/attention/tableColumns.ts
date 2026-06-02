export const columns = [
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
      title: '关注状态',
      dataIndex: 'isgz',
      width:80,
      dicData:[
        {
          value:'-1',
          label:'未关注',
          color:'red',
        },        
        {
            value:'1',
            label:'已关注',
            color:'green',
        },               
      ]
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
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 120,      
      operationData:[{
        type:'text',
        icon:'AmazonOutlined',
        label:'详情',
        lx:'indicator_name',
        click:true,
      },{
        type:'link',
        icon:'HeartFilled',
        label:'关注',
        lx:'1',
        click:true,
        display:'isgz',
        displayValue:'-1',
      },{
        type:'link',
        icon:'HeartOutlined',
        label:'取消',
        danger:'1',
        lx:'2',
        click:true,
        display:'isgz',
        displayValue:'1',
      }]
    },
];


export const columns_GZ = [
  {
    title: '指标名称',
    dataIndex: 'indicator_name',
    width:200,
    click:true,
  },
  {
    title: '指标编码',
    dataIndex: 'indicator_code',
    width:150,
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
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 80,
    operationData:[{
      type:'link',
      icon:'HeartOutlined',
      label:'取消',
      danger:'1',
      lx:'2',
      click:true,
    }]
  },
];

