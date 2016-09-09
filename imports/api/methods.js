import {Subjects} from "./module_tables.js"

Meteor.methods({
    
    getDateHist: function(){
            //console.log("running the aggregate")
            if (Meteor.isServer){
                var foo = Subjects.aggregate([{$match: {entry_type: "demographic"}},{$group:{_id:"$metrics.DCM_StudyDate", count:{$sum:1}}}])
                //console.log(foo)
                return foo
            }

            
      },
	  
	  getScatterData: function(entry_type, metric1, metric2, filter){
          if (Meteor.isServer){
          var no_null = filter
          no_null["entry_type"] = entry_type
          var metric_name1 = "metrics."+metric1
		  var metric_name2 = "metrics."+metric2
          //no_null["metrics"] = {}
          //no_null["metrics"]["$ne"] = null
          
          if (Object.keys(no_null).indexOf(metric_name1) >=0 ){
              no_null[metric_name1]["$ne"] = null
          }
          else{
              no_null[metric_name1] = {$ne: null}
          }
          if (Object.keys(no_null).indexOf(metric_name2) >=0 ){
              no_null[metric_name2]["$ne"] = null
		 	}
          else{
              no_null[metric_name2] = {$ne: null}
          }
	  var collection = Subjects.find(no_null).fetch()
		  console.log(collection[0])
		  console.log(collection.length)
	  //console.log(Subjects.find(no_null, {sort: [[metric_name, "ascending"]], limit: 1}).fetch()[0]["metrics"][metric])
	  //console.log(collection[0]["metrics"][metric])
		  var m1 = new Array(collection.length);
		  var m2 = new Array(collection.length);
		  for (i=0; i< collection.length; i++) {
		  	m1[i] = collection[i]["metrics"][metric1]
			m2[i] = collection[i]["metrics"][metric2]
		  }
		  reg_result = findLineByLeastSquares(m1, m2)
		  console.log(m1[0] + "," + m2[0])
				  
		  var data_pairs = [], shapes = ['circle'];
		  var name_length = metric1.length-3;
          data_pairs.push({
              //key: metric_name1.substring(0,5),
              key: entry_type + ": " + metric1.substring(0,name_length),
			  values: [],
              slope: reg_result[2],
              intercept: reg_result[3]
			  //slope: 1.4,
			  //intercept: -10
          });
		  for (j = 0; j < collection.length; j++) {
			  //for (j = 0; j < 40; j++) {
				  var coll = collection[j]
				  data_pairs[0].values.push({
                  x: m1[j],
                  y: m2[j],
					  info: {entry_type: coll.entry_type, name: coll.name, subject_id: coll.subject_id},
				  //x: j,
			      //y: j,  
                  size: .5,
                  shape: shapes[j % shapes.length]
              });
          }

		  
		  return data_pairs
				 
		  var slope = reg_result[2], intercept = reg_result[3];
		  
		  final_data = [slope,intercept,m1,m2];
		  //return final_data;
		  
		  
		  
			  function findLineByLeastSquares(values_x, values_y) {
			      var sum_x = 0;
			      var sum_y = 0;
			      var sum_xy = 0;
			      var sum_xx = 0;
			      var count = 0;

			      /*
			       * We'll use those variables for faster read/write access.
			       */
			      var x = 0;
			      var y = 0;
			      var values_length = values_x.length;

			      if (values_length != values_y.length) {
			          throw new Error('The parameters values_x and values_y need to have same size!');
			      }

			      /*
			       * Nothing to do.
			       */
			      if (values_length === 0) {
			          return [ [], [] ];
			      }

			      /*
			       * Calculate the sum for each of the parts necessary.
			       */
			      for (var v = 0; v < values_length; v++) {
			          x = values_x[v];
			          y = values_y[v];
			          sum_x += x;
			          sum_y += y;
			          sum_xx += x*x;
			          sum_xy += x*y;
			          count++;
			      }

			      /*
			       * Calculate m and b for the formular:
			       * y = x * m + b
			       */
			      var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
			      var b = (sum_y/count) - (m*sum_x)/count;

			      /*
			       * We will make the x and y result line now
			       */
			      var result_values_x = [];
			      var result_values_y = [];

			      for (var v = 0; v < values_length; v++) {
			          x = values_x[v];
			          y = x * m + b;
			          result_values_x.push(x);
			          result_values_y.push(y);
			      }

			      return [result_values_x, result_values_y,m,b];
			  }
  		    
			//function randomData(groups, points) { //# groups,# points per group
  		        var data = [], shapes = ['circle'];
  		        //for (i = 0; i < groups; i++) {
  		            data.push({
  		                key: 'Group ' + 0,
  		                values: [],
  		                slope: Math.random() - .01,
  		                intercept: Math.random() - .5
  		            });
  		            for (j = 0; j < 40; j++) {
  		                data[0].values.push({
  		                    x: Math.random()*10,
  		                    y: Math.random()*10,
  		                    size: Math.random(),
  		                    shape: shapes[j % shapes.length]
  		                });
  		            }
					//}
  		        //return data;
				//}
		  
		  
	  
	  }//end isServer
		
	  },
      
    getHistogramData: function(entry_type, metric, bins, filter){
          //console.log("getting histogram data")
          if (Meteor.isServer){
          var no_null = filter
          no_null["entry_type"] = entry_type
          var metric_name = "metrics."+metric
          //no_null["metrics"] = {}
          //no_null["metrics"]["$ne"] = null
          
          if (Object.keys(no_null).indexOf(metric_name) >=0 ){
              no_null[metric_name]["$ne"] = null
          }
          else{
              no_null[metric_name] = {$ne: null}
          }
          
          //console.log("in the server, the filter is", no_null)
          
          var minval = Subjects.find(no_null, {sort: [[metric_name, "ascending"]], limit: 1}).fetch()[0]["metrics"][metric]
          //console.log(Subjects.find(no_null, {sort: [[metric_name, "ascending"]], limit: 1}).fetch())
          var maxval = Subjects.find(no_null, {sort: [[metric_name, "descending"]], limit: 1}).fetch()[0]["metrics"][metric]
                    //var minval = Subjects.findOne({"entry_type": entry_type, no_null}, {sort: minsorter})//.sort(maxsorter).limit(1)
          
          //console.log(metric, minval, maxval)
          var bin_size = (maxval -minval)/(bins+1)
          console.log("the bin size is", bin_size)
          
          if (bin_size){
                var foo = Subjects.aggregate([{$match: no_null}, 
                    {$project: {lowerBound: {$subtract: ["$metrics."+metric, 
                        {$mod: ["$metrics."+metric, bin_size]}]}}}, 
                    {$group: {_id: "$lowerBound", count: {$sum: 1}}}])
                var output = {}
                output["histogram"] = _.sortBy(foo, "_id")
                output["minval"] = minval*0.95
                output["maxval"] = maxval*1.05
                return output
          }
          else{
                var output= {}
                output["histogram"] = []
                output["minval"] = 0
                output["maxval"] = 0
                return output
          }}
          //{entry_type: "freesurfer"}

          
                            
      },
    
    get_subject_ids_from_filter: function(filter){
        if (Meteor.isServer){
            var subids = []
            var cursor = Subjects.find(filter,{subject_id:1, _id:0})
            //console.log("the filter in this method is", filter, cursor.count())
            var foo = cursor.forEach(function(val){subids.push(val.subject_id)})
            //console.log("the number subjects to filter by are",filter, subids.length)
            return subids
        }
        
    },
    
    updateQC: function(qc, form_data){
        //console.log(form_data)
        Subjects.update({entry_type: qc.entry_type, name:qc.name}, {$set: form_data})
    },
    
    get_metric_names: function(entry_type){
        
        if (Meteor.isServer){
            no_null= {metrics: {$ne: {}}, "entry_type": entry_type}
            var dude = Subjects.findOne(no_null)
            if (dude){
                return Object.keys(dude["metrics"])
            }
            //console.log("dude is", dude)
            
        }
        
    },
    
    save_query: function(name, gSelector){
        var topush = {"name": name, "selector": gSelector}
        Meteor.users.update(this.userId, {$push: {queries: topush}})
    },
    
    removeQuery: function(query, name){

        console.log("query is", query, name)
        var topull = {"name": name, "selector": query}
        Meteor.users.update(this.userId, {$pull: {queries: topull}})
        
    },

    get_generator: function(entry_type){
        if (Meteor.isServer){
        var myjson = {};
        myjson = JSON.parse(Assets.getText("generator.json"));
        if (entry_type == null){
            return myjson
        }
        else{
        console.log("entry_Type", entry_type)
        //console.log("myjson", myjson.modules)
        var output =  myjson.modules.find(function(o){return o.entry_type == entry_type})
        console.log("output is", output)
        return output
        }}
    },

    getMsidGroups: function(study_tag){
        var stage1 = {"$match": {"entry_type": "demographic", "Study Tag": study_tag}}
        var stage2 = {"$group": {_id: "$msid"}}
        if (Meteor.isServer){
            var output = []
            var cursor = Subjects.aggregate([stage1, stage2])
            cursor.forEach(function(item, item_idx, arr){
                output.push(item._id)
            })
            return output
        }
    }
    
  });
