(function ($) {
  $(document).ready(function(){

      // button to load sample data for rapid testing
      $( "#loadsampledata" ).click(function() {
        $.get('data.txt', function(data) {
          console.log(data);
          $('#input').val(data);
          convert2xml();
        });
      });

      // run conversion when either textarea is changed (set to #input to enable editing of the output within the result)
      $('textarea').on("change keyup paste", function() {
        convert2xml();
      });

      function convert2xml(){
        console.log('Start converting...');

        // grab input
        var inputData = $('#input').val();

        // split on person
        personSplitChar = 'P|';

        // check if input is not empty and first row is a person
        // maybe a bit unnecessary, but simple and might be relevant depending on who is the intended end user
        if(inputData.length > 0 && inputData.substr(0, 2) != personSplitChar){
          $('#output').val('Input error!\nInput must begin with '+personSplitChar);
          exit
        }

        inputData = inputData.split(personSplitChar);
        // remove empty first element
        inputData.shift()
        
        // start outputData
        var outputData = '';

        // loop through each person
        $.each(inputData, function(index, item) {
          
          // add personSplitChar back in to use as an indicator
          personLines = 'P|'+this;

          // split each person on lines
          personLines = personLines.split('\n');

          // create containers to rearrange the data output
          person = '';
          address = '';
          phone = '';
          family = '';
          
          // create array for family members
          familyMembers = [];

          // var for current person
          personOutput = '';

          // for each line within a person
          $.each(personLines, function(index, item) {

            // fill with individual lines
            newLineSection = '';

            // discard empty lines
            if(this != ''){
              //console.log('each personLines: '+this);

              // check type of content and add to output with structure
              // P = person   [firstname, lastname]
              // A = address  [street, city, zipcode]
              // T = phone    [mobile, home]  
              // F = family   [name, birthyear]     // note: name for family members is a single field for full name,
                                                    // second slot contains birthyear instead of lastname – differs from <person>.

              // determine what type of content each line is by looking at the beginning of the line,
              // then add the individual content to it's respective structure
              
              // Person
              if(this.substr(0,2) == 'P|'){
                // split on pipe
                newLineSection = this.split('|');

                // pick out firstname and lastname (split for readability)
                firstname = newLineSection[1];
                lastname = newLineSection[2];

                // add to output with structure
                person = '<firstname>'+firstname+'</firstname>\n<lastname>'+lastname+'</lastname>\n';

              // Address
              }else if(this.substr(0,2) == 'A|'){
                // split on pipe
                newLineSection = this.split('|');

                // pick out street, city and zip code
                street = newLineSection[1];
                city = newLineSection[2];
                zipcode = newLineSection[3];

                // wrap lines
                street = '<street>'+street+'</street>\n';
                city = '<city>'+city+'</city>\n';
                zipcode = '<zipcode>'+zipcode+'</zipcode>\n';

                // if not a family member, add to output with structure directly
                if(familyMembers.length <= 0){
                address = '<address>\n'+street+city+zipcode+'</address>\n';
                }else{
                  // if a family member, add new values to corresponding index of family member
                  familyMembers[familyMembers.length-1] = familyMembers[familyMembers.length-1]+street+city+zipcode;
                } 

              // Phone
              }else if(this.substr(0,2) == 'T|'){
                // split on pipe
                newLineSection = this.split('|');

                // pick out mobile and home phone numbers
                mobile = newLineSection[1];
                home = newLineSection[2];

                // wrap lines
                mobile = '<mobile>'+mobile+'</mobile>\n';
                home = '<home>'+home+'</home>\n';

                // if not a family member, add to output with structure directly

                if(familyMembers.length <= 0){
                  phone = '<phone>\n'+mobile+home+'</phone>\n';
                }else{
                  // if a family member, add new values to corresponding index of family member
                  familyMembers[familyMembers.length-1] = familyMembers[familyMembers.length-1]+mobile+home;
                }
              
              // Family
              }else if(this.substr(0,2) == 'F|'){
                // split on pipe
                newLineSection = this.split('|');

                // pick out full name and birthyear
                fullname = newLineSection[1];
                birthyear = newLineSection[2];

                // wrap lines
                fullname = '<name>'+fullname+'</name>\n';
                birthyear = '<birthyear>'+birthyear+'</birthyear>\n';

                // add to output with structure
                //family = '<family>\n'+fullname+birthyear+'</family>\n'; // cant wrap them here, as they are added to the family member array later
                family = fullname+birthyear;

                // add data to array of family members
                // any additional data is added to the array in the next loop within the same person if values exist
                // (see respective if statements)
                familyMembers.push(family);
                //console.log('members in family: '+familyMembers.length);
                
              // Error - unmatched row type 
              }else{
                //newLineSection = '[error!]';
                $('#output').val('Input error!\nUnknown or incomplete row type:'+this);
                exit
              }
            }
          });

          // for each index in familyMembers array wrap family members in the family structure
          for(var n = 0; n < familyMembers.length; n++) {
            familyMembers[n] = '<family>\n' + familyMembers[n] + '</family>\n';
          }

          // combine all data for the current person
          outputData = outputData + '<person>\n' + person + address + phone + familyMembers.join('') + '</person>\n';
          
          // convert 'undefined' in output to empty string (or other value) – quick and semi-dirty
          outputData = outputData.replace(/undefined/g, '');
        });

        // end outputData with people wrapper unless empty
        if(outputData != ''){
          outputData = '<people>\n' + outputData + '</people>';
        }else{
          // clear output if there is nothing to show from new input
          $('#output').val('');
        }

        $('#output').val(outputData);

        //console.log('Finished');
      }
      
});

})(jQuery);