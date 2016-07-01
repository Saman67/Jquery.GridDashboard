
$.fn.gridDashboard = function(options) {
    var opts = $.extend({
        gap: 10,
        maxColumns: 5,
        minWidth: 100,
        maxWidth: 1024,
        heightRatio: 0.5,
        placeHolder: '<div class="placeholder"></div>',
        columnSizes: [
            { size: 1920, column: 5 },
            { size: 1600, column: 4 },
            { size: 1200, column: 3 },
            { size: 768, column: 2 },
            { size: 480, column: 1 }
        ]
    }, options );

    var grid = this,
        gridWidth = grid.width(),
        gridHeight,
        columns = 5,//calculateColumns(gridWidth),
        newColumns,
        blockWidth = (gridWidth / columns) - opts.gap,
        blockHeight = blockWidth * opts.heightRatio,
        blocks = grid.find('.grid-item'),
        placeHolder = $(opts.placeHolder).hide();

    grid.append(placeHolder);

    var gridMatrix = new GridMatrix();      // Create object of grid class
    gridMatrix.initializeMatrix(blocks);    // Initialize the main matrix based on html data (position - size)

    gridMatrix.shapeMatrix(columns);        // shape matrix based on the columns
    gridMatrix.positionBlocks(blocks, blockWidth, blockHeight, opts.gap);

    $(window).resize(function(event) {
        gridWidth = grid.width();
        blockWidth = (gridWidth / columns) - opts.gap;
        newColumns = calculateColumns(gridWidth);

        // Only shape the matrix if it is needed
        if(newColumns != columns) {
            columns = newColumns
            gridMatrix.shapeMatrix(columns);
        }

        // Change position and size of the blocks accordingly
        gridMatrix.positionBlocks(blocks, blockWidth, blockHeight, opts.gap);
    });

    blocks.draggable({
        revert: true,
        snap: '.placeholder',
        //grid: [1, 1],
        //snapTolerance: 50,
        //containment: '.grid',
        drag: function(event,ui) {

            var left = ui.position.left - (ui.position.left % blockWidth),
                top = ui.position.top - (ui.position.top % blockHeight);

            placeHolder.css({
                //width: width,
                //height: height,
                top: top,
                left: left,
                position: 'absolute'
            }).show();

            /*
            var snapTolerance = $(this).draggable('option', 'snapTolerance');
            var topRemainder = ui.position.top % 20;
            var leftRemainder = ui.position.left % 20;

            if (topRemainder <= snapTolerance) {
                ui.position.top = ui.position.top - topRemainder;
            }

            if (leftRemainder <= snapTolerance) {
                ui.position.left = ui.position.left - leftRemainder;
            }*/
        }
    });

    return this;

    function calculateColumns(width) {
        for(var i=0; i < opts.columnSizes.length; i++)
            if(width >= opts.columnSizes[i].size)
                return opts.columnSizes[i].column;
        return 1;
    }
};


var GridMatrix = function() {

};

GridMatrix.prototype = {

    initializeMatrix: function (blocks) {
        var matrix = [],
            index = 1;

        blocks.each(function () {

            var $block = $(this),
                w = parseInt($block.attr('data-w')),
                h = parseInt($block.attr('data-h')),
                x = parseInt($block.attr('data-x')),
                y = parseInt($block.attr('data-y'));

            for (var i = 0; i < h; i++) {
                while (matrix[y + i] == undefined)
                    matrix.push(new Array());
                for (var j = 0; j < w; j++) {
                    while (matrix[y + i][x + j] == undefined)
                        matrix[y + i].push(0);
                    matrix[y + i][x + j] = { i: index, w: w, h: h };
                }
            }

            $block.attr('data-index', index++);
        });

        this.initialMatrix = matrix;
    },

    shapeMatrix: function (newColumn) {

        this.initialMatrix;                                 // read the initial matrix but don't change it
        this.printMatrix(this.initialMatrix);               // Use Print matrix to see the matrix in browser's console for debugging

        var newMatrix = this.initialMatrix;                 // TODO:  implement the function here

        this.matrix = newMatrix;
    },

    printMatrix: function (matrix) {
        for (var i = 0; i < matrix.length; i++) {
            var line = '';
            for (var j = 0; j < matrix[i].length; j++)
                line += ("0" + matrix[i][j].i).slice(-2) + ' | ';
            console.log(line);
        }
    },

    positionBlocks: function(blocks, blockWidth, blockHeight, gap) {
        var index = -1, block, width, height, top, left;

        for(var i=0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].i > index) {
                    index = this.matrix[i][j].i;
                    width = this.matrix[i][j].w * blockWidth + this.matrix[i][j].w * gap - gap;
                    height = this.matrix[i][j].h * blockHeight + this.matrix[i][j].h * gap - gap;
                    top = i * blockHeight + i * gap;
                    left = j * blockWidth + j * gap;

                    block = $('.grid-item[data-index=' + this.matrix[i][j].i + ']');
                    block.css({
                        width: width,
                        height: height,
                        top: top,
                        left: left,
                        position: 'absolute'
                    });
                }
            }
        }
    }
}