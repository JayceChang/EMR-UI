export const columns =(cols)=>{return [].concat([
    {
      title: '三级指标编码',
      dataIndex: 'indicator_code',
      width:150,
    },
    {
      title: '三级指标名称',
      dataIndex: 'indicator_name',
      width:200,
    },   
    {
      title: '采集指标编码',
      dataIndex: 'indicator_code_jc',
      width:180,
    },
    {
      title: '采集指标名称',
      dataIndex: 'indicator_name_jc',
      width:200,
    },
    {
      title: '指标导向',
      dataIndex: 'zbdx',
      width:100,
      dicData:[
        {
          value:'1',
          label:'监测比较',
          color:'',
        },        
        {
          value:'2',
          label:'逐步提高',
          color:'',
        },        
        {
          value:'3',
          label:'逐步降低',
          color:'',
        },        
        {
          value:'4',
          label:'逐步改善',
          color:'',
        },        
      ]
    }],cols,[   
    {
      title: '指标单位',
      dataIndex: 'zbdw',
      width:80,
      dicData:[
        {
          value:'1',
          label:'比值(X:1)',
          color:'',
        },        
        {
            value:'2',
            label:'百分比',
            color:'',
        },    
        {
            value:'3',
            label:'千分比',
            color:'',
        },    
        {
            value:'4',
            label:'万分比',
            color:'',
        },    
        {
          value:'5',
          label:'人次',
          color:'',
        },        
        {
            value:'6',
            label:'例',
            color:'',
        },    
        {
            value:'7',
            label:'个',
            color:'',
        },    
        {
            value:'8',
            label:'分钟',
            color:'',
        }, 
        {
          value:'9',
          label:'人',
          color:'',
        },        
        {
            value:'10',
            label:'天',
            color:'',
        },    
        {
            value:'11',
            label:'元',
            color:'',
        },    
        {
            value:'12',
            label:'台次',
            color:'',
        },    
        {
          value:'13',
          label:'床日',
          color:'',
        },  
        {
          value:'14',
          label:'张',
          color:'',
        },  
        {
          value:'',
          label:'未配置',
          color:'',
        },          
      ]
    },
    {
      title: '是否开展',
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
          title: '数据责任部门',
          dataIndex: 'department',
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
          title: '数据源',
          dataIndex: 'sjy',
          width:150,
    },
    {
          title: '汇总部门',
          dataIndex: 'department',
          width:150,
    },         
    {
          title: '统计语句及说明',
          dataIndex: 'sqldesc',
          width:180,
          ellipsis: true,
          tooltip: true, 
    },         
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 240,     
      operationData:[{
        type:'link',
        className:'c_009688',
        icon:'EditOutlined',
        label:'编辑',
        lx:'edit',
        click:true,
      },{
        type:'link',
        className:'c_ff9c00',
        icon:'SnippetsOutlined',
        label:'日志',
        lx:'log',
        click:true,
      },{
        type:'link',
        className:'c_f00',
        icon:'LockOutlined',
        label:'锁定',
        lx:'suoding',
        click:true,
      },{
        type:'text',
        className:'',
        icon:'KeyOutlined',
        label:'解锁',
        lx:'jiesuo',
        click:true,
      }]
    },
])};

export const columnsLog =[
  {
    title: '年份',
    dataIndex: 'year',
    width:100,
  },   
  {
    title: '新值',
    dataIndex: 'value',
    width:100,
  },   
  {
    title: '旧值',
    dataIndex: 'old_value',
    width:100,
  },   
  {
    title: '操作时间',
    dataIndex: 'create_time',
    width:150,
  },   
  {
    title: '操作人',
    dataIndex: 'create_user',
    width:100,
  },   
  {
    title: '备注说明',
    dataIndex: 'remark',
    width:180,
    ellipsis: true,
    tooltip: true, 
  },   
  {
    title: '操作日志',
    dataIndex: 'k_desc',
    width:280,
    ellipsis: true,
    tooltip: true, 
  },   

]