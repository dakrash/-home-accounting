function counter(val) {

    function counterVal() {
        if (val)
            return inputValue(val);
        else
            return 'value = "1"'
    }

    return `<div class="col qty">
    <div class="row">
    <div class="col-auto" style="padding-right: 0 !important;">
    <span class="minus btn-custom-yellow btn-number" disabled="disabled" data-type="minus" data-field="quant[1]">-</span>
    </div>
    <div class="col">
    <input id="productQuantity" type="text" name="quant[1]" class="input-number count form-input" ${counterVal()} min="1" max="100">
    </div>
    <div class="col-auto" style="padding-left: 0 !important;">
    <span class="plus btn-custom-yellow btn-number"  data-type="plus" data-field="quant[1]">+</span>
    </div>
    </div>
    </div>`;
}


function eventsCounter(elems) {
    for(let i = 0; i<elems.length; i++) {
        let el = $(elems[i]);

        el.find('.btn-number').click(function (e) {
            e.preventDefault();
            fieldName = $(this).attr('data-field');
            type = $(this).attr('data-type');
            var input = el.find("input[name='" + fieldName + "']");
            var currentVal = parseInt(input.val());
            if (!isNaN(currentVal)) {
                if (type == 'minus') {

                    if (currentVal > input.attr('min')) {
                        input.val(currentVal - 1).change();
                    }
                    if (parseInt(input.val()) == input.attr('min')) {
                        $(this).attr('disabled', true);
                    }

                } else if (type == 'plus') {

                    if (currentVal < input.attr('max')) {
                        input.val(currentVal + 1).change();
                    }
                    if (parseInt(input.val()) == input.attr('max')) {
                        $(this).attr('disabled', true);
                    }

                }
            } else {
                input.val(0);
            }
        });
        el.find('.input-number').focusin(function () {
            $(this).data('oldValue', $(this).val());
        });
        el.find('.input-number').change(function () {

            minValue = 0.1;
            maxValue = parseFloat($(this).attr('max'));
            valueCurrent = parseFloat($(this).val());

            name = $(this).attr('name');
            if (valueCurrent >= minValue) {
                $(".btn-number[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
            } else {
                alert('Извините, значение не может быть меньше 0.1');
                $(this).val($(this).data('oldValue'));
            }
            if (valueCurrent <= maxValue) {
                $(".btn-number[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
            } else {
                alert('Извините, значение не может быть больше 100');
                $(this).val($(this).data('oldValue'));
            }
        });
        inputNumberKeydown(el.find(".input-number"))
    }
}