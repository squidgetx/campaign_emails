d3.json('all_emails.json').then((all_emails) => {
  console.log(all_emails)

  let get_timeseries = function(all_emails, term)  {
    let timeFormat = d3.timeParse("%Y-%m-%d");
    return all_emails
      .map((message) => { return {date: timeFormat(message['date']), unft_date: message['date'], count: message['body_words'][term] || 0}})
      .sort((b, a) => b.unft_date.localeCompare(a.unft_date))
  }

  let updateGraph; // scope
  let selectedWord = 'fake'
  let candidate = 'trump'
  d3.select('#candidate-img').attr('src', candidate +'.png')

  d3.json('emails.json').then((data) => {
    d3.select('#wordcloud-container')
      .append('svg')
      .attr('id', 'wordcloud')

    let draw = function(words) {
          update(words)
    }

    let update = function(words) {
      let g = d3.select('#g')
        .selectAll('text')
        .data(words, (d) => d.text)
      g.enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Helvetica")
        .style("opacity", 0)
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on('mouseover', (d, i, nodes) => { 
          d3.select(nodes[i]).style('opacity', 1) 
          d3.select(nodes[i]).style('cursor', 'pointer') 
        })
        .on('mouseout', (d, i, nodes) => { 
          d3.select(nodes[i]).style('opacity', 0.7) 
        })
        .on('click', (d, i, nodes) => {
          updateGraph(candidate, d.text, true) 
          selectedWord = d.text
          d3.select('#g').selectAll('text').style('fill', function(d) { (d.text == selectedWord) ? 'red' : 'black' })
        })
        .transition()
          .duration(1000)
          .style('opacity', 0.7)
      g.transition()
        .duration(1000)
        .style('opacity', 0.7)
        .style("font-size", function(d) { return d.size + "px"; })
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
      g.exit().transition()
        .style('opacity', () => 0)
        .remove();
    }
    
    let layout = {size: [800, 300]}

    let updateCloud = function(candidate) {
      let fontSizeFunc = d3.scalePow()
        .exponent(0.5)
        .domain(d3.extent(data[candidate]['data'].slice(0, 150).map(e => e.value)))
        .range([1, 96])
      let newLayout = d3.layout.cloud()
        .size(layout.size)
        .words(data[candidate]['data'].slice(0, 150))
        .padding(2)
        .fontSize((d) => fontSizeFunc(d.value))
        .rotate((_word) => 0)
        .on('end', update)
      newLayout.start()
    }

    d3.select('#wordcloud')
        .attr('width', layout.size[0])
        .attr('height', layout.size[1])
      .append('g')
        .attr("transform", "translate(" + layout.size[0] / 2 + "," + layout.size[1] / 2 + ")")
        .attr('id', 'g')

    updateCloud(candidate)

    let submitFunc = function() {
      candidate = this.value
      updateCloud(candidate)
      updateGraph(candidate, selectedWord, true)
      d3.select('#candidate-img').attr('src', candidate +'.png')
    }

    d3.select('#candidate-select')
      .on('change', submitFunc)
      .selectAll('option')
      .data(Object.keys(data))
    .enter().append('option')
      .attr('value', (d) => d)
      .attr('selected', (d) => d == 'trump' ? 'selected' : null)
      .html((d) => d)

    // GRAPH
    let margin = {top: 0, right: 50, bottom: 50, left: 50}
    , width = 800 - margin.left - margin.right 
    , height = 350 - margin.top - margin.bottom; 

    let svg = d3.select("#graph").append("svg")
      .attr('id', 'graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create axis but don't assign the scale yet
    svg.append("g")
      .attr("class", "x axis xaxis")
      .attr("transform", "translate(0," + height + ")")
      //.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
    svg.append("g")
      .attr("class", "y axis yaxis")
      //.call(d3.axisLeft(yScale));
    svg.append("path")
      .attr("class", "mainpath line")

    updateGraph = function(candidate_, word, anim=false) {
      let dataset = get_timeseries(all_emails[candidate_], word)
      console.log(dataset)
      // dataset is an array of dates and count
      // most code stolen from https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
      let xScale = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(dataset, d => d.date));
      let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset.map(d => d.count))]) 
        .range([height, 0]); // output
      // update axis scales
      svg.select('.yaxis')
        .call(d3.axisLeft(yScale));
      svg.select('.xaxis')
        .call(d3.axisBottom(xScale));

      let line = d3.line()
        .x(function(d, i) { return xScale(d.date); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.count); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

      let path = d3.select('.mainpath');
      d3.select('#graph-svg').transition()
      if (anim) {
        path.transition(1000).attr("d", line(dataset)); // 11. Calls the line generator
      } else {
        path.attr("d", line(dataset)); // 11. Calls the line generator
      }
      d3.select('#word').html('occurences of "' + word + '" per week')
    }

    updateGraph('trump', 'fake')
  })
})


